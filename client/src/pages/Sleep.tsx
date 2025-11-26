import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SoundOption = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  // Using free ambient sound URLs
  url: string;
};

const sounds: SoundOption[] = [
  {
    id: "rain",
    name: "Gentle Rain",
    description: "Soft rainfall for peaceful sleep",
    emoji: "🌧️",
    url: "https://cdn.pixabay.com/audio/2022/05/13/audio_257112ce99.mp3",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    description: "Calming waves on the shore",
    emoji: "🌊",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4dedf3f94c.mp3",
  },
  {
    id: "forest",
    name: "Forest Ambience",
    description: "Birds and nature sounds",
    emoji: "🌲",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_13c0f7d03e.mp3",
  },
  {
    id: "white-noise",
    name: "White Noise",
    description: "Consistent background sound",
    emoji: "📻",
    url: "https://cdn.pixabay.com/audio/2023/10/30/audio_24ee4bc3f4.mp3",
  },
];

export default function Sleep() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const createSession = trpc.sleep.create.useMutation();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const handleSoundSelect = (soundId: string) => {
    if (isPlaying) {
      handleStop();
    }
    setSelectedSound(soundId);
  };

  const handlePlay = () => {
    if (!selectedSound) {
      toast.error("Please select a sound first");
      return;
    }

    const sound = sounds.find((s) => s.id === selectedSound);
    if (!sound) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(sound.url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume[0] / 100;
    }

    audioRef.current.play().catch((error) => {
      toast.error("Failed to play sound");
      console.error(error);
    });

    setIsPlaying(true);
    setStartTime(new Date());
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleStop = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (startTime && selectedSound) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // minutes
      if (duration > 0) {
        try {
          await createSession.mutateAsync({
            soundType: selectedSound,
            duration,
            startTime,
            endTime: new Date(),
          });
          toast.success("Sleep session saved");
        } catch (error) {
          toast.error("Failed to save session");
        }
      }
    }

    setIsPlaying(false);
    setStartTime(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950 dark:via-blue-950 dark:to-purple-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Sleep Support</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Your Ambient Sound</CardTitle>
            <CardDescription>Select a calming sound to help you relax and sleep</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handleSoundSelect(sound.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSound === sound.id
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <div className="text-3xl mb-2">{sound.emoji}</div>
                  <h3 className="font-semibold text-lg mb-1">{sound.name}</h3>
                  <p className="text-sm text-muted-foreground">{sound.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Volume Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
              <span className="text-sm font-medium w-12 text-right">{volume[0]}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex gap-4">
                {!isPlaying ? (
                  <Button size="lg" onClick={handlePlay} disabled={!selectedSound} className="px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Play
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={handlePause} variant="secondary" className="px-8">
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </Button>
                    <Button size="lg" onClick={handleStop} variant="outline" className="px-8">
                      Stop & Save
                    </Button>
                  </>
                )}
              </div>

              {isPlaying && startTime && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">Playing: {sounds.find((s) => s.id === selectedSound)?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Started at {startTime.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Sleep Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Use headphones or speakers at a comfortable volume</p>
            <p>• Create a dark, cool environment for better sleep</p>
            <p>• Establish a consistent bedtime routine</p>
            <p>• Avoid screens 30 minutes before sleep</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
