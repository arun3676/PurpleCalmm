import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

type Mood = "very_bad" | "bad" | "neutral" | "good" | "very_good";

const moodOptions: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: "very_bad", label: "Very Bad", emoji: "😢", color: "bg-red-500" },
  { value: "bad", label: "Bad", emoji: "😔", color: "bg-orange-500" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "bg-yellow-500" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-green-500" },
  { value: "very_good", label: "Very Good", emoji: "😊", color: "bg-emerald-500" },
];

export default function Journal() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: entries, refetch } = trpc.journal.list.useQuery();
  const createEntry = trpc.journal.create.useMutation();
  const updateEntry = trpc.journal.update.useMutation();
  const deleteEntry = trpc.journal.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    try {
      if (editingId) {
        await updateEntry.mutateAsync({
          id: editingId,
          title: title || undefined,
          content,
          mood,
        });
        toast.success("Journal entry updated");
        setEditingId(null);
      } else {
        await createEntry.mutateAsync({
          title: title || undefined,
          content,
          mood,
        });
        toast.success("Journal entry saved");
      }

      setTitle("");
      setContent("");
      setMood("neutral");
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save entry");
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setTitle(entry.title || "");
    setContent(entry.content);
    setMood(entry.mood);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEntry.mutateAsync({ id });
      toast.success("Entry deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const getMoodInfo = (moodValue: string) => {
    return moodOptions.find((m) => m.value === moodValue) || moodOptions[2];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Journal</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/journal-trends">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Trends
              </Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                  setMood("neutral");
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      id="title"
                      placeholder="Give your entry a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>How are you feeling?</Label>
                    <div className="flex gap-2 mt-2">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMood(option.value)}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            mood === option.value
                              ? "border-primary bg-primary/10 scale-105"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-2xl mb-1">{option.emoji}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Your thoughts</Label>
                    <Textarea
                      id="content"
                      placeholder="Write about your day, your feelings, or anything on your mind..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={createEntry.isPending || updateEntry.isPending}>
                      {editingId ? "Update Entry" : "Save Entry"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!entries || entries.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Start Your Journey</CardTitle>
              <CardDescription>
                Your journal is a safe space to express yourself. Click "New Entry" to begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No entries yet</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Write Your First Entry
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const moodInfo = getMoodInfo(entry.mood);
              return (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{moodInfo.emoji}</span>
                          <Badge variant="secondary">{moodInfo.label}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        {entry.title && <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteEntry.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-foreground">{entry.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
