
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Check, Calendar, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  author_name: string;
  user_id: string | null;
  created_at: string;
  votes: number | null;
  views: number | null;
  has_accepted_answer: boolean | null;
}

interface Answer {
  id: string;
  content: string;
  author_name: string;
  user_id: string | null;
  created_at: string;
  votes: number | null;
  is_accepted: boolean | null;
  question_id: string;
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newAnswer, setNewAnswer] = useState("");

  // Fetch question details
  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      if (!id) throw new Error('Question ID is required');
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Question;
    },
    enabled: !!id,
  });

  // Fetch answers for this question
  const { data: answers, isLoading: answersLoading } = useQuery({
    queryKey: ['answers', id],
    queryFn: async () => {
      if (!id) throw new Error('Question ID is required');
      
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Answer[];
    },
    enabled: !!id,
  });

  // Update question views when page loads
  useEffect(() => {
    if (question && id) {
      supabase
        .from('questions')
        .update({ views: (question.views || 0) + 1 })
        .eq('id', id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['question', id] });
        });
    }
  }, [question, id, queryClient]);

  // Submit new answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !id) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('answers')
        .insert({
          content,
          question_id: id,
          author_name: user.email?.split('@')[0] || 'Anonymous',
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewAnswer("");
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      toast({
        title: "Answer posted!",
        description: "Your answer has been successfully submitted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error posting answer",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Vote on answer mutation
  const voteAnswerMutation = useMutation({
    mutationFn: async ({ answerId, increment }: { answerId: string; increment: number }) => {
      if (!user) throw new Error('User must be logged in');
      
      const answer = answers?.find(a => a.id === answerId);
      if (!answer) throw new Error('Answer not found');
      
      const { error } = await supabase
        .from('answers')
        .update({ votes: (answer.votes || 0) + increment })
        .eq('id', answerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded."
      });
    },
    onError: (error) => {
      toast({
        title: "Error voting",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Accept answer mutation
  const acceptAnswerMutation = useMutation({
    mutationFn: async (answerId: string) => {
      if (!user || !question) throw new Error('User must be logged in and own the question');
      if (question.user_id !== user.id) throw new Error('Only question owner can accept answers');
      
      // First, unaccept all answers for this question
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', id);
      
      // Then accept the selected answer
      const { error } = await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);
      
      if (error) throw error;
      
      // Update question to mark it as having an accepted answer
      await supabase
        .from('questions')
        .update({ has_accepted_answer: true })
        .eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', id] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      toast({
        title: "Answer accepted",
        description: "This answer has been marked as the accepted solution."
      });
    },
    onError: (error) => {
      toast({
        title: "Error accepting answer",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to post an answer.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    submitAnswerMutation.mutate(newAnswer);
  };

  const handleVote = (answerId: string, isUpvote: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to vote on answers.",
        variant: "destructive"
      });
      return;
    }
    
    voteAnswerMutation.mutate({ 
      answerId, 
      increment: isUpvote ? 1 : -1 
    });
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to accept answers.",
        variant: "destructive"
      });
      return;
    }
    
    acceptAnswerMutation.mutate(answerId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (questionLoading || answersLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded"></div>
          <div className="h-24 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Question not found</h2>
          <Button onClick={() => navigate("/")}>
            Back to Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold line-clamp-2">
            {question.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Asked {formatTimeAgo(question.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{question.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote Controls */}
                <div className="flex flex-col items-center gap-2 w-12">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-xl">{question.votes || 0}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="prose prose-sm max-w-none mb-6">
                    <div className="whitespace-pre-wrap">{question.description}</div>
                  </div>
                  
                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Author Info */}
                  <div className="flex justify-end">
                    <div className="text-sm">
                      <span className="text-muted-foreground">asked by </span>
                      <span className="font-medium">{question.author_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {answers?.length || 0} Answer{(answers?.length || 0) !== 1 ? 's' : ''}
              </h2>
            </div>

            {answers && answers.length > 0 ? (
              answers.map((answer) => (
                <Card key={answer.id} className={answer.is_accepted ? "border-green-200 bg-green-50/50" : ""}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Vote Controls */}
                      <div className="flex flex-col items-center gap-2 w-12">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleVote(answer.id, true)}
                          disabled={voteAnswerMutation.isPending}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-xl">{answer.votes || 0}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleVote(answer.id, false)}
                          disabled={voteAnswerMutation.isPending}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        
                        {/* Accept Answer Button (only for question owner) */}
                        {user && question.user_id === user.id && (
                          <Button
                            variant={answer.is_accepted ? "default" : "ghost"}
                            size="icon"
                            className={`h-8 w-8 mt-2 ${answer.is_accepted ? 'text-green-600' : ''}`}
                            onClick={() => handleAcceptAnswer(answer.id)}
                            title={answer.is_accepted ? "Accepted answer" : "Accept this answer"}
                            disabled={acceptAnswerMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {/* Answer Content */}
                      <div className="flex-1 min-w-0">
                        {answer.is_accepted && (
                          <div className="flex items-center gap-2 mb-3 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">Accepted Answer</span>
                          </div>
                        )}
                        
                        <div className="prose prose-sm max-w-none mb-4">
                          <div className="whitespace-pre-wrap">{answer.content}</div>
                        </div>
                        
                        {/* Answer Meta */}
                        <div className="flex justify-end text-sm text-muted-foreground">
                          <div>
                            <span>answered {formatTimeAgo(answer.created_at)} by </span>
                            <span className="font-medium text-foreground">{answer.author_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No answers yet. Be the first to answer!</p>
              </div>
            )}
          </div>

          {/* Submit Answer */}
          {user ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <RichTextEditor
                    value={newAnswer}
                    onChange={setNewAnswer}
                    placeholder="Write your answer here..."
                    className="min-h-[200px]"
                  />
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={submitAnswerMutation.isPending}
                  >
                    {submitAnswerMutation.isPending ? "Posting..." : "Post Your Answer"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please log in to post an answer.
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Question Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Question Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asked</span>
                  <span>{formatTimeAgo(question.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{question.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span>{answers?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Questions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Related Questions</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <a href="#" className="text-primary hover:underline line-clamp-2">
                    How to join tables in SQL with multiple conditions?
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">5 answers</div>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-primary hover:underline line-clamp-2">
                    Best practices for database column naming conventions
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">3 answers</div>
                </div>
                <div className="text-sm">
                  <a href="#" className="text-primary hover:underline line-clamp-2">
                    SQL performance optimization tips for large datasets
                  </a>
                  <div className="text-xs text-muted-foreground mt-1">8 answers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
