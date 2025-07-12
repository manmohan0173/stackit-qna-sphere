
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to ask a question.
        </p>
        <Button onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    );
  }

  const submitQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('questions')
        .insert({
          title,
          description,
          tags: tags.length > 0 ? tags : null,
          author_name: user.email?.split('@')[0] || 'Anonymous',
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Question posted!",
        description: "Your question has been successfully submitted."
      });
      navigate(`/question/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error posting question",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim()) && tags.length < 5) {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your question.",
        variant: "destructive"
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please provide a description for your question.",
        variant: "destructive"
      });
      return;
    }

    submitQuestionMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Ask a Question</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's your programming question? Be specific."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific and imagine you're asking a question to another person.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Provide details about your question. Include any relevant code, error messages, or what you've tried so far..."
                    className="min-h-[300px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include all the information someone would need to answer your question.
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-3">
                    <Input
                      id="tags"
                      placeholder="Add up to 5 tags to describe what your question is about (press Enter to add)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      disabled={tags.length >= 5}
                    />
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Add tags to help others find and answer your question. ({tags.length}/5)
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitQuestionMutation.isPending}
                >
                  {submitQuestionMutation.isPending ? "Posting..." : "Post Your Question"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Ask a Good Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Search first</h4>
                <p className="text-muted-foreground">
                  Check if your question has been asked before.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Be specific</h4>
                <p className="text-muted-foreground">
                  Provide details about what you're trying to achieve.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Include code</h4>
                <p className="text-muted-foreground">
                  Show what you've tried and any error messages.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Use proper formatting</h4>
                <p className="text-muted-foreground">
                  Format code blocks and use clear language.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["React", "JavaScript", "Node.js", "SQL", "Python", "CSS", "HTML", "TypeScript"].map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      if (!tags.includes(tag) && tags.length < 5) {
                        setTags([...tags, tag]);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
