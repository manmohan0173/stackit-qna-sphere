
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
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
        description: "Please enter a title for your question.",
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
    
    if (tags.length === 0) {
      toast({
        title: "Tags required",
        description: "Please add at least one tag to help categorize your question.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically submit to your backend
    toast({
      title: "Question posted!",
      description: "Your question has been successfully submitted."
    });
    
    navigate("/");
  };

  const suggestedTags = ["React", "JavaScript", "TypeScript", "Node.js", "CSS", "HTML", "SQL", "Python"];

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
        <div>
          <h1 className="text-2xl font-bold">Ask a Question</h1>
          <p className="text-muted-foreground">Get help from the community</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Be specific and imagine you're asking a friend"
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    {title.length}/150 characters
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Provide all the details someone would need to answer your question..."
                    className="min-h-[300px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Include all the details someone would need to answer your question. Use the formatting tools above to make your question clear and easy to read.
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">
                    Tags <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-3">
                    {/* Current Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Tag Input */}
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add a tag and press Enter"
                      className="text-base"
                    />
                    
                    {/* Suggested Tags */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Suggested tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags
                          .filter(tag => !tags.includes(tag))
                          .map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => {
                              if (!tags.includes(tag)) {
                                setTags([...tags, tag]);
                              }
                            }}
                          >
                            + {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add up to 5 tags to help categorize your question
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 sm:flex-none">
                    Post Question
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Great questions include:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>A clear, specific title</li>
                  <li>Background context</li>
                  <li>What you've tried</li>
                  <li>Expected vs actual results</li>
                  <li>Relevant code snippets</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Before posting:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Search for similar questions</li>
                  <li>Check official documentation</li>
                  <li>Try debugging yourself first</li>
                </ul>
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
                {suggestedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      if (!tags.includes(tag)) {
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
