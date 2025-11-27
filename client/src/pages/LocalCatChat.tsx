import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Send } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { getChatMessages, clearChatHistory, getUserSettings, saveUserSettings } from "@/lib/localStorage";
import { sendChatMessage } from "@/lib/localChat";

type PersonalityMode = "comforting" | "funny" | "rude";

export default function LocalCatChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(getChatMessages());
  const [selectedMode, setSelectedMode] = useState<PersonalityMode>("comforting");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const personalityModes = [
    { mode: "comforting" as const, icon: "💜", label: "Comforting" },
    { mode: "funny" as const, icon: "😹", label: "Funny" },
    { mode: "rude" as const, icon: "😼", label: "Sassy" },
  ];

  useEffect(() => {
    const settings = getUserSettings();
    setSelectedMode(settings.chatPersonality);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const handleModeChange = (mode: PersonalityMode) => {
    setSelectedMode(mode);
    saveUserSettings({ chatPersonality: mode });
    toast.success(`Rani is now ${mode}!`);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      await sendChatMessage(userMessage);
      setMessages(getChatMessages());
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearChatHistory();
    setMessages([]);
    toast.success("Chat cleared!");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0;

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

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-white shadow-lg border-2 border-purple-200">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">😺</div>
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">
                    Rani the Cat
                  </h2>
                  <p className="text-gray-600">A gentle place to talk</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <Card
                className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none'
                    : 'bg-purple-50 border-2 border-purple-200'
                }`}
              >
                <CardContent className="p-4">
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🐾</span>
                      <span className="font-bold text-purple-700">Rani</span>
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="bg-purple-50 border-2 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-600">Rani is typing...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-purple-100 shadow-lg p-4 shrink-0">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-full border-2 border-purple-200 focus-visible:ring-purple-500"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full px-6 shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
