import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Heart, Trash2, TrendingUp, Calendar, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";

const btsMembers = ["RM", "Jin", "Suga", "J-Hope", "Jimin", "V", "Jungkook"];

const btsMemberColors: Record<string, string> = {
  "RM": "from-purple-500 to-indigo-500",
  "Jin": "from-pink-400 to-pink-500",
  "Suga": "from-gray-600 to-gray-700",
  "J-Hope": "from-orange-400 to-yellow-500",
  "Jimin": "from-blue-400 to-cyan-500",
  "V": "from-green-400 to-emerald-500",
  "Jungkook": "from-purple-400 to-pink-500",
};

interface BtsEntry {
  id: string;
  quote: string;
  member?: string;
  reflection?: string;
  mood?: string;
  createdAt: number;
}

interface WeightChallenge {
  startWeight: number;
  targetWeight: number;
  startDate: number;
  endDate: number;
  logs: WeightLog[];
}

interface WeightLog {
  id: string;
  weight: number;
  date: number;
  note?: string;
}

export default function MyJourneys() {
  const [btsQuote, setBtsQuote] = useState("");
  const [btsMember, setBtsMember] = useState("");
  const [btsReflection, setBtsReflection] = useState("");
  const [btsMood, setBtsMood] = useState("");
  const [btsEntries, setBtsEntries] = useState<BtsEntry[]>([]);

  // Weight Challenge State
  const [challenge, setChallenge] = useState<WeightChallenge | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    startWeight: "",
    targetWeight: "",
    days: "45",
  });
  const [logWeight, setLogWeight] = useState("");
  const [logNote, setLogNote] = useState("");

  useEffect(() => {
    loadBtsEntries();
    loadChallenge();
  }, []);

  const loadBtsEntries = () => {
    const data = localStorage.getItem("bts_entries");
    if (data) {
      setBtsEntries(JSON.parse(data));
    }
  };

  const loadChallenge = () => {
    const data = localStorage.getItem("weight_challenge");
    if (data) {
      setChallenge(JSON.parse(data));
    }
  };

  const handleBtsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!btsQuote.trim()) {
      toast.error("Please enter a BTS quote");
      return;
    }

    const newEntry: BtsEntry = {
      id: Date.now().toString(),
      quote: btsQuote,
      member: btsMember || undefined,
      reflection: btsReflection || undefined,
      mood: btsMood || undefined,
      createdAt: Date.now(),
    };

    const entries = [newEntry, ...btsEntries];
    localStorage.setItem("bts_entries", JSON.stringify(entries));
    setBtsEntries(entries);
    
    toast.success("BTS quote saved! 💜");
    setBtsQuote("");
    setBtsMember("");
    setBtsReflection("");
    setBtsMood("");
  };

  const handleDeleteBts = (id: string) => {
    if (!confirm("Delete this BTS quote?")) return;
    const entries = btsEntries.filter(e => e.id !== id);
    localStorage.setItem("bts_entries", JSON.stringify(entries));
    setBtsEntries(entries);
    toast.success("Quote deleted");
  };

  const handleSetupChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(setupData.startWeight);
    const target = parseFloat(setupData.targetWeight);
    const days = parseInt(setupData.days);

    if (!start || !target || !days) {
      toast.error("Please fill all fields");
      return;
    }

    if (target <= start) {
      toast.error("Target weight must be higher than start weight");
      return;
    }

    const newChallenge: WeightChallenge = {
      startWeight: start,
      targetWeight: target,
      startDate: Date.now(),
      endDate: Date.now() + (days * 24 * 60 * 60 * 1000),
      logs: [{
        id: Date.now().toString(),
        weight: start,
        date: Date.now(),
        note: "Challenge started! 💪"
      }]
    };

    localStorage.setItem("weight_challenge", JSON.stringify(newChallenge));
    setChallenge(newChallenge);
    setShowSetup(false);
    toast.success("Challenge started! You got this! 🎯");
  };

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;
    
    const weight = parseFloat(logWeight);
    if (!weight) {
      toast.error("Please enter your weight");
      return;
    }

    const newLog: WeightLog = {
      id: Date.now().toString(),
      weight,
      date: Date.now(),
      note: logNote || undefined
    };

    const updatedChallenge = {
      ...challenge,
      logs: [newLog, ...challenge.logs]
    };

    localStorage.setItem("weight_challenge", JSON.stringify(updatedChallenge));
    setChallenge(updatedChallenge);
    setLogWeight("");
    setLogNote("");
    toast.success("Weight logged! 📊");
  };

  const handleResetChallenge = () => {
    if (!confirm("Reset your challenge? This will delete all progress.")) return;
    localStorage.removeItem("weight_challenge");
    setChallenge(null);
    setShowSetup(false);
    toast.success("Challenge reset");
  };

  const getChallengeStats = () => {
    if (!challenge) return null;

    const currentWeight = challenge.logs[0]?.weight || challenge.startWeight;
    const gained = currentWeight - challenge.startWeight;
    const target = challenge.targetWeight - challenge.startWeight;
    const progress = Math.min((gained / target) * 100, 100);
    const daysLeft = Math.max(0, differenceInDays(challenge.endDate, Date.now()));
    const remaining = Math.max(0, challenge.targetWeight - currentWeight);

    return { currentWeight, gained, target, progress, daysLeft, remaining };
  };

  const stats = getChallengeStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-purple-700 mb-2">My Journeys 💜</h1>
          <p className="text-gray-600">BTS Army & Weight Challenge</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="bts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="bts" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              BTS Army
            </TabsTrigger>
            <TabsTrigger value="weight" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Weight Journey
            </TabsTrigger>
          </TabsList>

          {/* BTS Army Tab */}
          <TabsContent value="bts" className="space-y-4">
            {/* BTS Form */}
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
                  Daily BTS Quote
                </CardTitle>
                <CardDescription>Share your favorite BTS quotes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBtsSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="quote">Quote 💜</Label>
                    <Textarea
                      id="quote"
                      placeholder='"Love yourself, love myself, peace." - RM'
                      value={btsQuote}
                      onChange={(e) => setBtsQuote(e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="member">Member</Label>
                      <Select value={btsMember} onValueChange={setBtsMember}>
                        <SelectTrigger id="member" className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {btsMembers.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="btsMood">Feeling</Label>
                      <Select value={btsMood} onValueChange={setBtsMood}>
                        <SelectTrigger id="btsMood" className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_good">💜 Great</SelectItem>
                          <SelectItem value="good">😊 Good</SelectItem>
                          <SelectItem value="neutral">😐 Okay</SelectItem>
                          <SelectItem value="bad">😔 Bad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reflection">Reflection (Optional)</Label>
                    <Textarea
                      id="reflection"
                      placeholder="What does this mean to you?"
                      value={btsReflection}
                      onChange={(e) => setBtsReflection(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Quote
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* BTS Entries */}
            <div className="space-y-3">
              {btsEntries.length > 0 ? (
                btsEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-purple-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            {entry.member && (
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${btsMemberColors[entry.member]} mb-2`}>
                                {entry.member}
                              </div>
                            )}
                            <p className="italic text-gray-800">"{entry.quote}"</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBts(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {(entry.reflection || entry.mood) && (
                        <CardContent className="pt-0">
                          {entry.reflection && (
                            <p className="text-sm text-gray-600 mb-2">{entry.reflection}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            {format(new Date(entry.createdAt), "MMM d, yyyy")}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="border-2 border-purple-200">
                  <CardContent className="py-12 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-gray-600">No quotes yet. Start your Army journey! 💜</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Weight Challenge Tab */}
          <TabsContent value="weight" className="space-y-4">
            {!challenge || showSetup ? (
              <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Start Weight Challenge
                  </CardTitle>
                  <CardDescription>Set your goal and track progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSetupChallenge} className="space-y-4">
                    <div>
                      <Label htmlFor="startWeight">Current Weight (kg)</Label>
                      <Input
                        id="startWeight"
                        type="number"
                        step="0.1"
                        placeholder="50.0"
                        value={setupData.startWeight}
                        onChange={(e) => setSetupData({...setupData, startWeight: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        step="0.1"
                        placeholder="55.0"
                        value={setupData.targetWeight}
                        onChange={(e) => setSetupData({...setupData, targetWeight: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="days">Challenge Duration (days)</Label>
                      <Input
                        id="days"
                        type="number"
                        placeholder="45"
                        value={setupData.days}
                        onChange={(e) => setSetupData({...setupData, days: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
                      Start Challenge 🎯
                    </Button>
                    {challenge && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowSetup(false)}
                      >
                        Cancel
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Progress Card */}
                <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl text-green-700">
                          {stats!.currentWeight} kg
                        </CardTitle>
                        <CardDescription>
                          Goal: {challenge.targetWeight} kg
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSetup(true)}
                      >
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-bold">{Math.round(stats!.progress)}%</span>
                      </div>
                      <Progress value={stats!.progress} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">+{stats!.gained.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Gained</div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-orange-600">{stats!.remaining.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">To Go</div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-600">{stats!.daysLeft}</div>
                        <div className="text-xs text-gray-600">Days Left</div>
                      </div>
                    </div>

                    {stats!.progress >= 100 && (
                      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🎉</div>
                        <div className="font-bold text-yellow-700">Challenge Complete!</div>
                        <div className="text-sm text-yellow-600">You did it! Amazing work! 💪</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Log Weight */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Log Today's Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogWeight} className="space-y-3">
                      <div>
                        <Label htmlFor="logWeight">Weight (kg)</Label>
                        <Input
                          id="logWeight"
                          type="number"
                          step="0.1"
                          placeholder="50.5"
                          value={logWeight}
                          onChange={(e) => setLogWeight(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="logNote">Note (Optional)</Label>
                        <Input
                          id="logNote"
                          placeholder="Feeling great today!"
                          value={logNote}
                          onChange={(e) => setLogNote(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Log Weight
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Weight History */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-700">Recent Logs</h3>
                  {challenge.logs.slice(0, 5).map((log) => (
                    <Card key={log.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-lg">{log.weight} kg</div>
                            {log.note && <div className="text-sm text-gray-600">{log.note}</div>}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.date), "MMM d")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
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
