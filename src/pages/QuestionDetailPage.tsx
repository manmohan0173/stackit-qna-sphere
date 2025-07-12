
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, Check, Calendar, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";

interface Answer {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  votes: number;
  isAccepted: boolean;
  userVote?: 'up' | 'down' | null;
}

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newAnswer, setNewAnswer] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([
    {
      id: 1,
      content: "You can use the CONCAT function in SQL to combine two columns:\n\n```sql\nSELECT CONCAT(column1, ' ', column2) AS combined_column\nFROM your_table;\n```\n\nThis will combine column1 and column2 with a space in between.",
      author: "sql_expert",
      createdAt: "1 hour ago",
      votes: 5,
      isAccepted: true,
      userVote: null
    },
    {
      id: 2,
      content: "Another approach is to use the || operator (works in PostgreSQL and SQLite):\n\n```sql\nSELECT column1 || ' ' || column2 AS combined_column\nFROM your_table;\n```",
      author: "db_master",
      createdAt: "30 minutes ago",
      votes: 2,
      isAccepted: false,
      userVote: null
    }
  ]);

  // Mock question data
  const question = {
    id: parseInt(id || "1"),
    title: "How to put 2 columns in a data set to make a separate column in SQL?",
    description: "I have a table with two columns: `first_name` and `last_name`. I want to combine them into a single column called `full_name`. What's the best approach to do this in SQL?\n\nHere's my table structure:\n\n```sql\nCREATE TABLE users (\n  id INT PRIMARY KEY,\n  first_name VARCHAR(50),\n  last_name VARCHAR(50)\n);\n```\n\nI've tried a few approaches but I'm not sure which is the most efficient or widely supported across different SQL databases.",
    tags: ["SQL", "Database", "MySQL"],
    author: "john_doe",
    createdAt: "2 hours ago",
    votes: 5,
    views: 24
  };

  const handleVote = (answerId: number, voteType: 'up' | 'down') => {
    setAnswers(prev => prev.map(answer => {
      if (answer.id === answerId) {
        const currentVote = answer.userVote;
        let newVotes = answer.votes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Remove previous vote
        if (currentVote === 'up') newVotes--;
        if (currentVote === 'down') newVotes++;

        // Apply new vote (or cancel if same)
        if (currentVote === voteType) {
          newUserVote = null; // Cancel vote
        } else {
          if (voteType === 'up') newVotes++;
          if (voteType === 'down') newVotes--;
        }

        return { ...answer, votes: newVotes, userVote: newUserVote };
      }
      return answer;
    }));

    toast({
      title: "Vote recorded",
      description: `Your ${voteType}vote has been recorded.`
    });
  };

  const handleAcceptAnswer = (answerId: number) => {
    setAnswers(prev => prev.map(answer => ({
      ...answer,
      isAccepted: answer.id === answerId ? !answer.isAccepted : false
    })));

    toast({
      title: "Answer accepted",
      description: "This answer has been marked as the accepted solution."
    });
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnswer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    const answer: Answer = {
      id: Date.now(),
      content: newAnswer,
      author: "current_user",
      createdAt: "just now",
      votes: 0,
      isAccepted: false,
      userVote: null
    };

    setAnswers(prev => [...prev, answer]);
    setNewAnswer("");
    
    toast({
      title: "Answer posted!",
      description: "Your answer has been successfully submitted."
    });
  };

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
              <span>Asked {question.createdAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{question.views} views</span>
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
                  <span className="font-semibold text-xl">{question.votes}</span>
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex justify-end">
                    <div className="text-sm">
                      <span className="text-muted-foreground">asked by </span>
                      <span className="font-medium">{question.author}</span>
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
                {answers.length} Answer{answers.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {answers.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? "border-green-200 bg-green-50/50" : ""}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Controls */}
                    <div className="flex flex-col items-center gap-2 w-12">
                      <Button 
                        variant={answer.userVote === 'up' ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleVote(answer.id, 'up')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-xl">{answer.votes}</span>
                      <Button 
                        variant={answer.userVote === 'down' ? "default" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleVote(answer.id, 'down')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      
                      {/* Accept Answer Button (only for question owner) */}
                      <Button
                        variant={answer.isAccepted ? "default" : "ghost"}
                        size="icon"
                        className={`h-8 w-8 mt-2 ${answer.isAccepted ? 'text-green-600' : ''}`}
                        onClick={() => handleAcceptAnswer(answer.id)}
                        title={answer.isAccepted ? "Accepted answer" : "Accept this answer"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1 min-w-0">
                      {answer.isAccepted && (
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
                          <span>answered {answer.createdAt} by </span>
                          <span className="font-medium text-foreground">{answer.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Answer */}
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
                <Button type="submit" className="w-full sm:w-auto">
                  Post Your Answer
                </Button>
              </form>
            </CardContent>
          </Card>
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
                  <span>{question.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span>{question.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Answers</span>
                  <span>{answers.length}</span>
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
