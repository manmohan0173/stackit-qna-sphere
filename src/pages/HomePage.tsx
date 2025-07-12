
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, MessageSquare, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  author_name: string;
  created_at: string;
  votes: number | null;
  views: number | null;
  has_accepted_answer: boolean | null;
}

const HomePage = () => {
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const { user } = useAuth();

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['questions', sortBy, filterBy],
    queryFn: async () => {
      let query = supabase
        .from('questions')
        .select('*');

      // Apply filters
      if (filterBy === 'unanswered') {
        // For now, we'll use a simple check - in a real app you'd join with answers table
        query = query.eq('has_accepted_answer', false);
      } else if (filterBy === 'answered') {
        query = query.eq('has_accepted_answer', true);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'votes') {
        query = query.order('votes', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Question[];
    },
  });

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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to StackIt</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A community-driven Q&A platform for developers
        </p>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Join our community to ask questions, share knowledge, and help fellow developers.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Questions</h1>
              <p className="text-muted-foreground">
                {questions ? `${questions.length} questions` : 'Loading questions...'}
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="votes">Most Votes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unanswered">Unanswered</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex lg:flex-col gap-4 lg:gap-2 lg:w-24">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-14" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">Error loading questions. Please try again.</p>
              </div>
            ) : questions && questions.length > 0 ? (
              questions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Stats - Mobile: Top, Desktop: Left */}
                      <div className="flex lg:flex-col gap-4 lg:gap-2 lg:w-24 lg:text-center">
                        <div className="flex lg:flex-col items-center gap-1">
                          <span className="font-semibold text-lg">{question.votes || 0}</span>
                          <span className="text-xs text-muted-foreground">votes</span>
                        </div>
                        <div className={`flex lg:flex-col items-center gap-1 ${question.has_accepted_answer ? 'text-green-600' : ''}`}>
                          <span className="font-semibold text-lg">0</span>
                          <span className="text-xs text-muted-foreground">answers</span>
                        </div>
                        <div className="flex lg:flex-col items-center gap-1">
                          <span className="font-semibold text-lg">{question.views || 0}</span>
                          <span className="text-xs text-muted-foreground">views</span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/question/${question.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {question.title}
                          </h3>
                        </Link>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {question.description}
                        </p>
                        
                        {/* Tags */}
                        {question.tags && question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {question.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Meta */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>asked {formatTimeAgo(question.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>by</span>
                            <span className="font-medium text-foreground">{question.author_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to ask a question!</p>
                <Button asChild>
                  <Link to="/ask">Ask Question</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="space-y-6">
            {/* Popular Tags */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["React", "JavaScript", "Node.js", "SQL", "Python", "CSS", "HTML", "TypeScript"].map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Answer upvoted</span>
                      <p className="text-muted-foreground">on "React hooks question"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">New answer posted</span>
                      <p className="text-muted-foreground">on "SQL JOIN query"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
