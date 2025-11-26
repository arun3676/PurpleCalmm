import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function CatChat() {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = trpc.chat.history.useQuery();
  const sendMessage = trpc.chat.send.useMutation();
  const clearHistory = trpc.chat.clear.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");

    try {
      await sendMessage.mutateAsync({ message: userMessage });
      refetch();
    } catch (error) {
      toast.error("Failed to send message");
      setMessage(userMessage); // Restore message on error
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear your chat history?")) return;

    try {
      await clearHistory.mutateAsync();
      toast.success("Chat history cleared");
      refetch();
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Cat Companion 🐱</h1>
              <p className="text-sm text-muted-foreground">Your supportive AI friend</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleClear} disabled={clearHistory.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {!messages || messages.length === 0 ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🐱</div>
                <CardTitle className="mb-2">Hello, friend! 💜</CardTitle>
                <CardDescription className="text-base">
                  I'm your AI cat companion. I'm here to listen, support, and help you through tough times. 
                  Feel free to share what's on your mind - I'm a good listener and I care about you.
                </CardDescription>
              </div>
            </CardContent>
          ) : (
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" && <div className="text-lg mb-1">🐱</div>}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="text-lg mb-1">🐱</div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <CardContent className="border-t pt-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendMessage.isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={sendMessage.isPending || !message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your cat companion is here to support you, but remember to seek professional help for serious concerns.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-lg">About Your Cat Companion</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>🐾 I'm designed to be empathetic, supportive, and understanding</p>
            <p>💬 Share your thoughts, feelings, or just chat about your day</p>
            <p>🌟 I can offer coping strategies and encouragement</p>
            <p>⚠️ I'm an AI and not a replacement for professional mental health support</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
