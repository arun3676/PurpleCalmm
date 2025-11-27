import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  emoji: string;
  note?: string;
  createdAt: number;
}

const moods = [
  { value: "amazing", emoji: "🤩", label: "Amazing", color: "from-yellow-400 to-orange-400" },
  { value: "happy", emoji: "😊", label: "Happy", color: "from-green-400 to-emerald-400" },
  { value: "okay", emoji: "😐", label: "Okay", color: "from-blue-400 to-cyan-400" },
  { value: "sad", emoji: "😢", label: "Sad", color: "from-indigo-400 to-purple-400" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "from-purple-400 to-pink-400" },
  { value: "angry", emoji: "😠", label: "Angry", color: "from-red-400 to-orange-400" },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<typeof moods[0] | null>(null);
  const [note, setNote] = useState("");
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = () => {
    const data = localStorage.getItem("mood_entries");
    if (data) {
      const entries = JSON.parse(data) as MoodEntry[];
      setRecentMoods(entries.slice(0, 5));
    }
  };

  const saveMood = () => {
    if (!selectedMood) {
      toast.error("Please select a mood first!");
      return;
    }

    const data = localStorage.getItem("mood_entries");
    const entries: MoodEntry[] = data ? JSON.parse(data) : [];

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]!,
      mood: selectedMood.label,
      emoji: selectedMood.emoji,
      note: note.trim() || undefined,
      createdAt: Date.now(),
    };

    entries.unshift(newEntry);
    localStorage.setItem("mood_entries", JSON.stringify(entries));

    toast.success("Mood logged! 💜");
    setSelectedMood(null);
    setNote("");
    loadMoods();
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
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Mood Tracker</h1>
          <p className="text-gray-600">How are you feeling today?</p>
        </motion.div>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border-2 border-purple-200 shadow-lg mb-6 p-6">
            <div className="grid grid-cols-3 gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-4 rounded-2xl transition-all ${
                    selectedMood?.value === mood.value
                      ? `bg-gradient-to-br ${mood.color} shadow-lg scale-105`
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className={`text-sm font-medium ${
                    selectedMood?.value === mood.value ? 'text-white' : 'text-gray-700'
                  }`}>
                    {mood.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Note Input */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-purple-200 shadow-lg mb-6 p-4">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind? (optional)"
                className="min-h-[120px] border-none focus-visible:ring-0 resize-none bg-white"
              />
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={saveMood}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xl py-8 rounded-2xl shadow-lg mb-6"
            >
              Log Mood
            </Button>
          </motion.div>
        )}

        {/* Recent Moods */}
        {recentMoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-purple-700 mb-4">Recent Moods</h2>
            <div className="space-y-3">
              {recentMoods.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white border border-purple-200 shadow-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{entry.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-purple-700">{entry.mood}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Link href="/">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-medium">Home</span>
              </button>
            </Link>
            <Link href="/calm">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                <span className="text-2xl">🧘</span>
                <span className="text-xs font-medium">Calm</span>
              </button>
            </Link>
            <Link href="/journal">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                <span className="text-2xl">✨</span>
                <span className="text-xs font-medium">Journal</span>
              </button>
            </Link>
            <div className="flex flex-col items-center gap-1 text-purple-600">
              <div className="bg-purple-100 rounded-2xl px-6 py-2 border-2 border-purple-600">
                <span className="text-2xl">💜</span>
              </div>
              <span className="text-xs font-bold">Mood</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
