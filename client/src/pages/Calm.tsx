import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type BreathingPattern = {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  description: string;
};

const patterns: Record<string, BreathingPattern> = {
  box: {
    name: "Box Breathing",
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    description: "Equal timing for all phases - great for focus and calm",
  },
  "4-7-8": {
    name: "4-7-8 Breathing",
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    description: "Promotes relaxation and helps with sleep",
  },
  calm: {
    name: "Calming Breath",
    inhale: 4,
    hold: 2,
    exhale: 6,
    holdAfter: 0,
    description: "Longer exhale for anxiety relief",
  },
};

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "idle";

export default function Calm() {
  const [selectedPattern, setSelectedPattern] = useState<string>("box");
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const createSession = trpc.breathing.create.useMutation();
  const pattern = patterns[selectedPattern];

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const phaseSequence: Phase[] = ["inhale", "hold", "exhale"];
    if (pattern.holdAfter > 0) phaseSequence.push("holdAfter");

    let currentPhaseIndex = 0;
    let currentPhase = phaseSequence[0];
    let timeLeft = currentPhase === 'inhale' ? pattern.inhale :
                   currentPhase === 'hold' ? pattern.hold :
                   currentPhase === 'exhale' ? pattern.exhale :
                   pattern.holdAfter;

    setPhase(currentPhase);
    setCountdown(timeLeft);

    intervalRef.current = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        currentPhaseIndex++;
        if (currentPhaseIndex >= phaseSequence.length) {
          currentPhaseIndex = 0;
          setTotalCycles((prev) => prev + 1);
        }
        currentPhase = phaseSequence[currentPhaseIndex];
        timeLeft = currentPhase === 'inhale' ? pattern.inhale :
                   currentPhase === 'hold' ? pattern.hold :
                   currentPhase === 'exhale' ? pattern.exhale :
                   pattern.holdAfter;
        setPhase(currentPhase);
        setCountdown(timeLeft);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, pattern]);

  const handleStart = () => {
    setIsActive(true);
    setStartTime(new Date());
    setTotalCycles(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = async () => {
    setIsActive(false);
    setPhase("idle");
    setCountdown(0);

    if (startTime && totalCycles > 0) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      try {
        await createSession.mutateAsync({
          exerciseType: selectedPattern,
          duration,
          completed: true,
        });
        toast.success(`Session saved! ${totalCycles} cycles completed`);
      } catch (error) {
        toast.error("Failed to save session");
      }
    }

    setTotalCycles(0);
    setStartTime(null);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "holdAfter":
        return "Hold";
      default:
        return "Ready";
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-400 to-cyan-400";
      case "hold":
        return "from-purple-400 to-pink-400";
      case "exhale":
        return "from-green-400 to-emerald-400";
      case "holdAfter":
        return "from-purple-400 to-pink-400";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Calm Exercises</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Your Breathing Pattern</CardTitle>
            <CardDescription>Select a technique that feels comfortable for you</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPattern} onValueChange={setSelectedPattern} disabled={isActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(patterns).map(([key, p]) => (
                  <SelectItem key={key} value={key}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-3 text-sm text-muted-foreground">{pattern.description}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className={`w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl transition-all duration-1000 ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              >
                <div className="text-center text-white">
                  <p className="text-3xl font-bold mb-2">{getPhaseText()}</p>
                  {phase !== "idle" && <p className="text-6xl font-bold">{countdown}</p>}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                {!isActive ? (
                  <Button size="lg" onClick={handleStart} className="px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Start
                  </Button>
                ) : (
                  <Button size="lg" onClick={handlePause} variant="secondary" className="px-8">
                    <Pause className="mr-2 h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button size="lg" onClick={handleReset} variant="outline" className="px-8">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>
              </div>

              {totalCycles > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-lg text-muted-foreground">
                    Cycles completed: <span className="font-bold text-foreground">{totalCycles}</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Find a comfortable, quiet place to practice</p>
            <p>• Focus on the rhythm rather than perfection</p>
            <p>• If you feel dizzy, pause and breathe normally</p>
            <p>• Practice regularly for best results</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
