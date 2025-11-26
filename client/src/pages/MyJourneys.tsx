import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, TrendingUp, Trash2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

export default function MyJourneys() {
  // BTS Journal state
  const [btsQuote, setBtsQuote] = useState("");
  const [btsMember, setBtsMember] = useState("");
  const [btsReflection, setBtsReflection] = useState("");
  const [btsMood, setBtsMood] = useState<"very_bad" | "bad" | "neutral" | "good" | "very_good" | "">("");

  // Weight tracking state
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [goalWeight, setGoalWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  const { data: btsEntries, refetch: refetchBts } = trpc.btsJournal.list.useQuery();
  const { data: weightEntries, refetch: refetchWeight } = trpc.weight.list.useQuery();
  
  const createBtsEntry = trpc.btsJournal.create.useMutation();
  const deleteBtsEntry = trpc.btsJournal.delete.useMutation();
  const createWeightEntry = trpc.weight.create.useMutation();
  const deleteWeightEntry = trpc.weight.delete.useMutation();

  const handleBtsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!btsQuote.trim()) {
      toast.error("Please enter a BTS quote");
      return;
    }

    try {
      await createBtsEntry.mutateAsync({
        quote: btsQuote,
        member: btsMember || undefined,
        reflection: btsReflection || undefined,
        mood: btsMood || undefined,
      });
      toast.success("BTS quote saved! 💜");
      setBtsQuote("");
      setBtsMember("");
      setBtsReflection("");
      setBtsMood("");
      refetchBts();
    } catch (error) {
      toast.error("Failed to save quote");
    }
  };

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    try {
      await createWeightEntry.mutateAsync({
        weight: Math.round(weightNum),
        unit,
        goalWeight: goalWeight ? Math.round(parseFloat(goalWeight)) : undefined,
        notes: weightNotes || undefined,
      });
      toast.success("Weight entry saved!");
      setWeight("");
      setGoalWeight("");
      setWeightNotes("");
      refetchWeight();
    } catch (error) {
      toast.error("Failed to save weight entry");
    }
  };

  const handleDeleteBts = async (id: number) => {
    if (!confirm("Delete this BTS quote?")) return;
    try {
      await deleteBtsEntry.mutateAsync({ id });
      toast.success("Quote deleted");
      refetchBts();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleDeleteWeight = async (id: number) => {
    if (!confirm("Delete this weight entry?")) return;
    try {
      await deleteWeightEntry.mutateAsync({ id });
      toast.success("Entry deleted");
      refetchWeight();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Prepare weight chart data
  const weightChartData = weightEntries?.slice(0, 30).reverse().map(entry => ({
    date: format(new Date(entry.createdAt), "MMM d"),
    weight: entry.weight,
  })) || [];

  const currentWeight = weightEntries?.[0]?.weight;
  const goalWeightValue = weightEntries?.[0]?.goalWeight;
  const progress = currentWeight && goalWeightValue ? 
    Math.round(((currentWeight - (weightEntries?.[weightEntries.length - 1]?.weight || currentWeight)) / (goalWeightValue - (weightEntries?.[weightEntries.length - 1]?.weight || currentWeight))) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Journeys 💜</h1>
            <p className="text-xs md:text-sm text-muted-foreground">BTS Army & Weight Gain</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <Tabs defaultValue="bts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="bts" className="text-sm md:text-base">
              <Sparkles className="w-4 h-4 mr-2" />
              BTS Army
            </TabsTrigger>
            <TabsTrigger value="weight" className="text-sm md:text-base">
              <TrendingUp className="w-4 h-4 mr-2" />
              Weight Journey
            </TabsTrigger>
          </TabsList>

          {/* BTS Army Journal Tab */}
          <TabsContent value="bts" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Heart className="w-5 h-5 text-purple-600 fill-purple-600" />
                  Daily BTS Quote
                </CardTitle>
                <CardDescription>Share your favorite BTS quote and reflect on it</CardDescription>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="btsMood">How does it make you feel?</Label>
                      <Select value={btsMood} onValueChange={(val) => setBtsMood(val as any)}>
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
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={createBtsEntry.isPending}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save Quote
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* BTS Entries List */}
            <div className="space-y-3">
              {btsEntries && btsEntries.length > 0 ? (
                btsEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={entry.member ? `bg-gradient-to-br ${btsMemberColors[entry.member]} bg-opacity-10` : ""}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            {entry.member && (
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${btsMemberColors[entry.member]} mb-2`}>
                                {entry.member}
                              </div>
                            )}
                            <p className="text-sm md:text-base italic text-foreground">"{entry.quote}"</p>
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
                            <p className="text-sm text-muted-foreground mb-2">{entry.reflection}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {entry.mood && <span>Mood: {entry.mood.replace('_', ' ')}</span>}
                            <span>{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                    <p className="text-muted-foreground">No BTS quotes yet. Start your Army journey! 💜</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Weight Gain Journey Tab */}
          <TabsContent value="weight" className="space-y-4">
            {/* Progress Card */}
            {currentWeight && goalWeightValue && (
              <Card className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-green-600">{currentWeight}</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-purple-600">{goalWeightValue}</p>
                      <p className="text-xs text-muted-foreground">Goal</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-orange-600">{Math.abs(goalWeightValue - currentWeight)}</p>
                      <p className="text-xs text-muted-foreground">To Go</p>
                    </div>
                  </div>

                  {weightChartData.length > 1 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="weight" stroke="oklch(0.55 0.18 285)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Add Weight Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Log Weight
                </CardTitle>
                <CardDescription>Track your weight gain journey</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleWeightSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="65"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={unit} onValueChange={(val) => setUnit(val as "kg" | "lbs")}>
                        <SelectTrigger id="unit" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="goalWeight">Goal Weight (Optional)</Label>
                    <Input
                      id="goalWeight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={goalWeight}
                      onChange={(e) => setGoalWeight(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weightNotes">Notes (Optional)</Label>
                    <Textarea
                      id="weightNotes"
                      placeholder="How are you feeling? What did you eat today?"
                      value={weightNotes}
                      onChange={(e) => setWeightNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    disabled={createWeightEntry.isPending}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Weight Entries List */}
            <div className="space-y-3">
              {weightEntries && weightEntries.length > 0 ? (
                weightEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-2xl font-bold text-green-600">
                              {entry.weight} {entry.unit}
                            </p>
                            {entry.goalWeight && (
                              <p className="text-sm text-muted-foreground">Goal: {entry.goalWeight} {entry.unit}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWeight(entry.id)}
                            className="shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {entry.notes && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-muted-foreground">No weight entries yet. Start tracking your journey!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
