import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays } from "date-fns";

const moodColors = {
  very_bad: "#ef4444",
  bad: "#f97316",
  neutral: "#eab308",
  good: "#22c55e",
  very_good: "#10b981",
};

const moodLabels = {
  very_bad: "Very Bad",
  bad: "Bad",
  neutral: "Neutral",
  good: "Good",
  very_good: "Very Good",
};

export default function JournalTrends() {
  const { data: entries } = trpc.journal.list.useQuery();

  if (!entries || entries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/journal">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Journal Trends</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>No Data Yet</CardTitle>
              <CardDescription>Start journaling to see your mood trends and insights</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Button asChild>
                <Link href="/journal">Go to Journal</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Calculate mood distribution
  const moodCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    name: moodLabels[mood as keyof typeof moodLabels],
    value: count,
    color: moodColors[mood as keyof typeof moodColors],
  }));

  // Calculate mood over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, "MMM d");
  });

  const moodOverTime = last7Days.map((day) => {
    const dayEntries = entries.filter((entry) => {
      const entryDate = format(new Date(entry.createdAt), "MMM d");
      return entryDate === day;
    });

    const moodValues = {
      very_bad: 1,
      bad: 2,
      neutral: 3,
      good: 4,
      very_good: 5,
    };

    const avgMood =
      dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / dayEntries.length
        : 0;

    return {
      day,
      mood: avgMood,
      entries: dayEntries.length,
    };
  });

  const totalEntries = entries.length;
  const avgMoodValue =
    entries.reduce((sum, entry) => {
      const moodValues = { very_bad: 1, bad: 2, neutral: 3, good: 4, very_good: 5 };
      return sum + moodValues[entry.mood as keyof typeof moodValues];
    }, 0) / totalEntries;

  const avgMoodLabel =
    avgMoodValue >= 4.5
      ? "Very Good"
      : avgMoodValue >= 3.5
      ? "Good"
      : avgMoodValue >= 2.5
      ? "Neutral"
      : avgMoodValue >= 1.5
      ? "Bad"
      : "Very Bad";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950 dark:via-purple-950 dark:to-pink-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/journal">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Journal Trends & Insights</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{totalEntries}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{avgMoodLabel}</p>
              <p className="text-sm text-muted-foreground mt-1">{avgMoodValue.toFixed(1)}/5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                {entries.filter((e) => new Date(e.createdAt) >= subDays(new Date(), 7)).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">entries</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood Over Time (Last 7 Days)</CardTitle>
              <CardDescription>Your average daily mood</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={moodOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip />
                  <Bar dataKey="mood" fill="oklch(0.55 0.18 285)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>How you've been feeling overall</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {avgMoodValue >= 4 && (
              <p>✨ You've been feeling great lately! Keep up the positive momentum.</p>
            )}
            {avgMoodValue < 4 && avgMoodValue >= 3 && (
              <p>💫 Your mood has been stable. Remember to celebrate small wins!</p>
            )}
            {avgMoodValue < 3 && (
              <p>💜 It's been a challenging time. Remember to be gentle with yourself and reach out for support when needed.</p>
            )}
            <p>📝 You've made {totalEntries} journal entries. Consistent journaling helps track patterns and progress.</p>
            {entries.filter((e) => new Date(e.createdAt) >= subDays(new Date(), 7)).length >= 5 && (
              <p>🎯 Great job journaling regularly this week! Consistency is key to understanding your patterns.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
