import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Target, TrendingUp, Calendar, Award } from "lucide-react";

interface WeightChallenge {
  startWeight: number;
  targetWeight: number;
  currentWeight: number;
  startDate: string;
  endDate: string;
  daysTotal: number;
}

interface WeightEntry {
  id: string;
  weight: number;
  note?: string;
  date: string;
  createdAt: number;
}

export default function WeightChallenge() {
  const [challenge, setChallenge] = useState<WeightChallenge | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  
  // Setup form
  const [startWeight, setStartWeight] = useState("");
  const [targetGain, setTargetGain] = useState("");
  const [days, setDays] = useState("");
  
  // Daily check-in
  const [todayWeight, setTodayWeight] = useState("");
  const [todayNote, setTodayNote] = useState("");

  useEffect(() => {
    loadChallenge();
    loadEntries();
  }, []);

  const loadChallenge = () => {
    const data = localStorage.getItem("weight_challenge");
    if (data) {
      setChallenge(JSON.parse(data));
    } else {
      setShowSetup(true);
    }
  };

  const loadEntries = () => {
    const data = localStorage.getItem("weight_entries");
    if (data) {
      setEntries(JSON.parse(data));
    }
  };

  const createChallenge = () => {
    const start = parseFloat(startWeight);
    const gain = parseFloat(targetGain);
    const duration = parseInt(days);

    if (!start || !gain || !duration) {
      toast.error("Please fill all fields!");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const newChallenge: WeightChallenge = {
      startWeight: start,
      targetWeight: start + gain,
      currentWeight: start,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysTotal: duration,
    };

    localStorage.setItem("weight_challenge", JSON.stringify(newChallenge));
    setChallenge(newChallenge);
    setShowSetup(false);
    toast.success("Challenge created! Let's do this! 💪");
  };

  const logWeight = () => {
    const weight = parseFloat(todayWeight);
    if (!weight || !challenge) {
      toast.error("Please enter your weight!");
      return;
    }

    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      weight,
      note: todayNote.trim() || undefined,
      date: new Date().toISOString().split('T')[0]!,
      createdAt: Date.now(),
    };

    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem("weight_entries", JSON.stringify(updatedEntries));

    const updatedChallenge = { ...challenge, currentWeight: weight };
    localStorage.setItem("weight_challenge", JSON.stringify(updatedChallenge));

    setChallenge(updatedChallenge);
    setEntries(updatedEntries);
    setTodayWeight("");
    setTodayNote("");

    const progress = ((weight - challenge.startWeight) / (challenge.targetWeight - challenge.startWeight)) * 100;
    
    if (progress >= 100) {
      toast.success("🎉 CHALLENGE COMPLETE! You did it! 🏆", { duration: 6000 });
    } else if (progress >= 75) {
      toast.success("💪 75% there! Almost at the finish line!", { duration: 5000 });
    } else if (progress >= 50) {
      toast.success("🌟 Halfway there! Keep pushing!", { duration: 5000 });
    } else if (progress >= 25) {
      toast.success("✨ 25% complete! Great start!", { duration: 5000 });
    } else {
      toast.success("Weight logged! Keep going! 💜", { duration: 4000 });
    }
  };

  const resetChallenge = () => {
    if (confirm("Are you sure you want to reset your challenge?")) {
      localStorage.removeItem("weight_challenge");
      localStorage.removeItem("weight_entries");
      setChallenge(null);
      setEntries([]);
      setShowSetup(true);
    }
  };

  if (showSetup || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 pb-24">
        <div className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-purple-700 mb-2">Weight Gain Challenge</h1>
            <p className="text-gray-600">Set your goal and track your progress!</p>
          </motion.div>

          <Card className="bg-white border-2 border-purple-200 shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={startWeight}
                  onChange={(e) => setStartWeight(e.target.value)}
                  placeholder="e.g., 50"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight to Gain (kg)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={targetGain}
                  onChange={(e) => setTargetGain(e.target.value)}
                  placeholder="e.g., 5"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge Duration (days)
                </label>
                <Input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g., 45"
                  className="text-lg"
                />
              </div>

              <Button
                onClick={createChallenge}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xl py-6"
              >
                Start Challenge 🎯
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((challenge.currentWeight - challenge.startWeight) / (challenge.targetWeight - challenge.startWeight)) * 100;
  const weightLeft = challenge.targetWeight - challenge.currentWeight;
  const daysElapsed = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = challenge.daysTotal - daysElapsed;
  const isComplete = progress >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-purple-700 mb-2">Weight Gain Challenge</h1>
          <p className="text-gray-600">
            {isComplete ? "🎉 Challenge Complete!" : `${daysLeft} days left`}
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={`border-2 shadow-lg p-6 mb-6 ${
            isComplete ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : 'bg-white border-purple-200'
          }`}>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-purple-700 mb-2">
                {challenge.currentWeight.toFixed(1)} kg
              </div>
              <div className="text-gray-600">
                Goal: {challenge.targetWeight.toFixed(1)} kg
              </div>
            </div>

            <Progress value={Math.min(progress, 100)} className="h-4 mb-4" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {weightLeft > 0 ? weightLeft.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-gray-600">kg left</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {Math.min(progress, 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">complete</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {daysLeft > 0 ? daysLeft : 0}
                </div>
                <div className="text-xs text-gray-600">days left</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Daily Check-in */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white border-2 border-purple-200 shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-purple-700 mb-4">Today's Check-in</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Weight (kg)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={todayWeight}
                    onChange={(e) => setTodayWeight(e.target.value)}
                    placeholder={challenge.currentWeight.toFixed(1)}
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={todayNote}
                    onChange={(e) => setTodayNote(e.target.value)}
                    placeholder="How are you feeling? What did you eat today?"
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={logWeight}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg py-6"
                >
                  Log Weight 📊
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-purple-700 mb-4">Progress History</h2>
            <div className="space-y-3 mb-6">
              {entries.slice(0, 5).map((entry, index) => (
                <Card key={entry.id} className="bg-white border border-purple-200 shadow-md p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-purple-700">
                          {entry.weight.toFixed(1)} kg
                        </span>
                        {index === 0 && index < entries.length - 1 && (
                          <span className={`text-sm font-medium ${
                            entry.weight > entries[index + 1]!.weight ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {entry.weight > entries[index + 1]!.weight 
                              ? `+${(entry.weight - entries[index + 1]!.weight).toFixed(1)} kg ↑`
                              : '→'}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-sm text-gray-600 mb-1">{entry.note}</p>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reset Button */}
        <Button
          onClick={resetChallenge}
          variant="outline"
          className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          Reset Challenge
        </Button>
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
            <Link href="/mood">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                <span className="text-2xl">💜</span>
                <span className="text-xs font-medium">Mood</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
