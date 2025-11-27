import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, Trash2, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";

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

export default function MyJourneys() {
  const [btsQuote, setBtsQuote] = useState("");
  const [btsMember, setBtsMember] = useState("");
  const [btsReflection, setBtsReflection] = useState("");
  const [btsMood, setBtsMood] = useState("");
  const [btsEntries, setBtsEntries] = useState<BtsEntry[]>([]);

  useEffect(() => {
    loadBtsEntries();
  }, []);

  const loadBtsEntries = () => {
    const data = localStorage.getItem("bts_entries");
    if (data) {
      setBtsEntries(JSON.parse(data));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
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

        {/* Weight Challenge Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Link href="/weight-challenge">
            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-bold text-green-700">Weight Gain Challenge</h2>
                    </div>
                    <p className="text-gray-600">Set goals, track progress, celebrate wins! 🎯</p>
                  </div>
                  <div className="text-4xl">💪</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* BTS Army Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
                BTS Army Journal
              </CardTitle>
              <CardDescription>Share your favorite BTS quotes and reflect</CardDescription>
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
                    <Label htmlFor="member">BTS Member</Label>
                    <Select value={btsMember} onValueChange={setBtsMember}>
                      <SelectTrigger id="member" className="mt-1">
                        <SelectValue placeholder="Select member" />
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
                    <Label htmlFor="btsMood">How does it feel?</Label>
                    <Select value={btsMood} onValueChange={setBtsMood}>
                      <SelectTrigger id="btsMood" className="mt-1">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very_good">💜 Very Good</SelectItem>
                        <SelectItem value="good">😊 Good</SelectItem>
                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                        <SelectItem value="bad">😔 Bad</SelectItem>
                        <SelectItem value="very_bad">😢 Very Bad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reflection">Your Reflection (Optional)</Label>
                  <Textarea
                    id="reflection"
                    placeholder="What does this quote mean to you?"
                    value={btsReflection}
                    onChange={(e) => setBtsReflection(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save Quote
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* BTS Entries List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-purple-700 mb-4">Your BTS Quotes</h2>
          {btsEntries.length > 0 ? (
            btsEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={entry.member ? `bg-gradient-to-br ${btsMemberColors[entry.member]} bg-opacity-10 border-2` : "border-2 border-purple-200"}>
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
                        className="shrink-0"
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
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {entry.mood && <span>Mood: {entry.mood.replace('_', ' ')}</span>}
                        <span>{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
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
                <p className="text-gray-600">No BTS quotes yet. Start your Army journey! 💜</p>
              </CardContent>
            </Card>
          )}
        </div>
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
