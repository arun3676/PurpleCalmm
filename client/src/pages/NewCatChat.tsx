import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";

type PersonalityMode = "comforting" | "funny" | "rude";

export default function NewCatChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>(user?.chatPersonality || "comforting");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch } = trpc.chat.history.useQuery();
  const sendMessage = trpc.chat.send.useMutation();
  const clearHistory = trpc.chat.clear.useMutation();
  const setPersonality = trpc.auth.setPersonality.useMutation();
  
  const personalityModes = [
    { mode: "comforting" as const, icon: "💜", label: "Comforting", description: "Warm & supportive" },
    { mode: "funny" as const, icon: "😹", label: "Funny", description: "Playful & humorous" },
    { mode: "rude" as const, icon: "😼", label: "Sassy", description: "Playfully rude" },
  ];
  
  useEffect(() => {
    if (user?.chatPersonality) {
      setSelectedMode(user.chatPersonality);
    }
  }, [user]);
  
  const handleModeChange = async (mode: PersonalityMode) => {
    setSelectedMode(mode);
    try {
      await setPersonality.mutateAsync({ personality: mode });
      toast.success(`Rani is now ${mode}!`);
    } catch (error) {
      toast.error("Failed to change personality");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
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
      setMessage(userMessage);
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to reset the conversation?")) return;

    try {
      await clearHistory.mutateAsync();
      toast.success("Conversation reset");
      refetch();
    } catch (error) {
      toast.error("Failed to reset conversation");
    }
  };

  const showWelcome = !messages || messages.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm shrink-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button
                variant="default"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full px-6 py-2 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={clearHistory.isPending}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full px-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {/* Personality Mode Selector */}
          <div className="bg-purple-50 rounded-2xl p-3">
            <p className="text-xs text-purple-700 mb-2 text-center font-medium">Rani's Mood</p>
            <div className="flex gap-2 justify-center">
              {personalityModes.map((mode) => (
                <motion.button
                  key={mode.mode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModeChange(mode.mode)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    selectedMode === mode.mode
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <span className="text-xs font-medium">{mode.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-md mx-auto w-full px-4">
        {showWelcome ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 pb-24">
            <Card className="bg-white shadow-lg border-0 w-full">
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-6xl">😺</div>
                <h2 className="text-2xl font-bold text-purple-700">Rani the Cat</h2>
                <p className="text-gray-600">A gentle place to talk</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg border-0 w-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">😺</span>
                  <h3 className="text-lg font-medium">Chat with Rani</h3>
                </div>
                <p className="text-white/90">A gentle place to talk and share</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 w-full">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <span className="text-xl">🐾</span>
                  <p className="font-medium">Rani</p>
                </div>
                <p className="text-gray-700">
                  Meow! 💜 I'm Rani. Tell me what's up, I'm listening.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden py-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 mr-2 mt-1">
                        <span className="text-2xl">😺</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                          : "bg-purple-50 text-gray-800 border border-purple-100"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2 text-purple-700">
                          <span className="text-sm">🐾</span>
                          <span className="text-sm font-medium">Rani</span>
                        </div>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <span className="text-2xl">😺</span>
                    </div>
                    <div className="max-w-[75%] rounded-2xl p-4 bg-purple-50 border border-purple-100">
                      <div className="flex items-center gap-2 mb-2 text-purple-700">
                        <span className="text-sm">🐾</span>
                        <span className="text-sm font-medium">Rani</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="shrink-0 pb-20 pt-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sendMessage.isPending}
              className="flex-1 rounded-full border-2 border-purple-200 focus:border-purple-400 bg-white px-4 py-3"
            />
            <Button
              type="submit"
              disabled={sendMessage.isPending || !message.trim()}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full px-6 shadow-lg"
            >
              Send
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Rani is here to support you, but remember to seek professional help for serious concerns.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
          <Link href="/">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">🏠</span>
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/calm">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">🧘</span>
              <span className="text-xs">Calm</span>
            </button>
          </Link>
          <Link href="/journal">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">✨</span>
              <span className="text-xs">Journal</span>
            </button>
          </Link>
          <Link href="/my-journeys">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">💜</span>
              <span className="text-xs">Mood</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
