
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

interface Question {
  id: number;
  title: string;
  description: string;
  tags: string[];
  author: string;
  createdAt: string;
  votes: number;
  answers: number;
  views: number;
  hasAcceptedAnswer: boolean;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    title: "How to put 2 columns in a data set to make a separate column in SQL?",
    description: "I have a table with two columns and I want to combine them into a single column. What's the best approach?",
    tags: ["SQL", "Database", "MySQL"],
    author: "john_doe",
    createdAt: "2 hours ago",
    votes: 5,
    answers: 3,
    views: 24,
    hasAcceptedAnswer: true
  },
  {
    id: 2,
    title: "React useState not updating component",
    description: "My React component is not re-rendering when I update state with useState hook. What could be wrong?",
    tags: ["React", "JavaScript", "Hooks"],
    author: "sarah_dev",
    createdAt: "4 hours ago",
    votes: 8,
    answers: 5,
    views: 45,
    hasAcceptedAnswer: false
  },
  {
    id: 3,
    title: "How to handle authentication in Node.js with JWT?",
    description: "I'm building a REST API and need to implement JWT authentication. Looking for best practices.",
    tags: ["Node.js", "JWT", "Authentication", "Security"],
    author: "mike_backend",
    createdAt: "1 day ago",
    votes: 12,
    answers: 7,
    views: 89,
    hasAcceptedAnswer: true
  }
];

const HomePage = () => {
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">All Questions</h1>
              <p className="text-muted-foreground">{mockQuestions.length} questions</p>
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
                  <SelectItem value="answers">Most Answers</SelectItem>
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
                  <SelectItem value="accepted">Has Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {mockQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Stats - Mobile: Top, Desktop: Left */}
                    <div className="flex lg:flex-col gap-4 lg:gap-2 lg:w-24 lg:text-center">
                      <div className="flex lg:flex-col items-center gap-1">
                        <span className="font-semibold text-lg">{question.votes}</span>
                        <span className="text-xs text-muted-foreground">votes</span>
                      </div>
                      <div className={`flex lg:flex-col items-center gap-1 ${question.hasAcceptedAnswer ? 'text-green-600' : ''}`}>
                        <span className="font-semibold text-lg">{question.answers}</span>
                        <span className="text-xs text-muted-foreground">answers</span>
                      </div>
                      <div className="flex lg:flex-col items-center gap-1">
                        <span className="font-semibold text-lg">{question.views}</span>
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
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Meta */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>asked {question.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>by</span>
                          <span className="font-medium text-foreground">{question.author}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              ))}
            </div>
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
