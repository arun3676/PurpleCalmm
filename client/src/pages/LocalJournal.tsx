import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { getJournalStreak, saveJournalEntry } from "@/lib/localStorage";

const dailyPrompts = [
  "💜 What made you smile today?",
  "💜 What are you grateful for right now?",
  "💜 How are you feeling in this moment?",
  "💜 What's one small win you had today?",
  "💜 What would make tomorrow better?",
  "💜 Who or what brought you comfort today?",
  "💜 What's something you're proud of?",
  "💜 What did you learn about yourself today?",
  "💜 What's one thing you want to let go of?",
  "💜 How did you take care of yourself today?",
];

export default function LocalJournal() {
  const [content, setContent] = useState("");
  const [streak, setStreak] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState("");

  useEffect(() => {
    // Get streak
    setStreak(getJournalStreak());
    
    // Get today's prompt (based on day of year)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setTodayPrompt(dailyPrompts[dayOfYear % dailyPrompts.length]!);
  }, []);

  const handleSave = () => {
    if (!content.trim()) {
      toast.error("Please write something first!");
      return;
    }

    const today = new Date().toISOString().split('T')[0]!;
    saveJournalEntry({
      date: today,
      content: content.trim(),
    });

    toast.success("Entry saved! 💜");
    setContent("");
    setStreak(getJournalStreak());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Journal</h1>
          <p className="text-gray-600">Your safe space to reflect</p>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-orange-100 to-pink-100 border-none shadow-lg mb-6 p-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔥</div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {streak} Day Streak!
                </div>
                <div className="text-orange-700">Keep writing daily!</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Today's Prompt */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-purple-50 border-2 border-purple-200 shadow-md mb-6 p-6">
            <div className="text-sm text-purple-600 font-medium mb-2">
              Today's prompt:
            </div>
            <div className="text-xl text-purple-700 font-medium">
              {todayPrompt}
            </div>
          </Card>
        </motion.div>

        {/* Journal Entry */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-purple-200 shadow-lg mb-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[300px] text-lg border-none focus-visible:ring-0 resize-none bg-white text-gray-700 placeholder:text-gray-400"
            />
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white text-xl py-8 rounded-2xl shadow-lg mb-6"
          >
            Save Entry
          </Button>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-purple-100 border-none shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💜</div>
              <div className="text-purple-700 font-medium italic">
                "Write your own story. You're the author of your life."
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <a href="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
              <span className="text-2xl">🏠</span>
              <span className="text-xs font-medium">Home</span>
            </a>
            <a href="/calm" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
              <span className="text-2xl">🧘</span>
              <span className="text-xs font-medium">Calm</span>
            </a>
            <div className="flex flex-col items-center gap-1 text-purple-600">
              <div className="bg-purple-100 rounded-2xl px-6 py-2 border-2 border-purple-600">
                <span className="text-2xl">✨</span>
              </div>
              <span className="text-xs font-bold">Journal</span>
            </div>
            <a href="/mood" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
              <span className="text-2xl">💜</span>
              <span className="text-xs font-medium">Mood</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
