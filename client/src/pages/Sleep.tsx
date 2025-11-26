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
  type: 'white-noise' | 'pink-noise' | 'brown-noise' | 'nature';
};

const sounds: SoundOption[] = [
  {
    id: "rain",
    name: "Gentle Rain",
    description: "Soft rainfall for peaceful sleep",
    emoji: "🌧️",
    type: "pink-noise",
  },
  {
    id: "ocean",
    name: "Ocean Waves",
    description: "Calming waves on the shore",
    emoji: "🌊",
    type: "brown-noise",
  },
  {
    id: "forest",
    name: "Forest Ambience",
    description: "Birds and nature sounds",
    emoji: "🌲",
    type: "nature",
  },
  {
    id: "white-noise",
    name: "White Noise",
    description: "Consistent background sound",
    emoji: "📻",
    type: "white-noise",
  },
];

// Generate audio using Web Audio API
function createAudioContext(type: string, volume: number): { context: AudioContext; gainNode: GainNode; stop: () => void } | null {
  try {
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);

    let oscillator: OscillatorNode | null = null;
    let noiseSource: AudioBufferSourceNode | null = null;

    if (type === 'white-noise' || type === 'pink-noise' || type === 'brown-noise') {
      const bufferSize = audioContext.sampleRate * 2;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'white-noise') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else if (type === 'pink-noise') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'brown-noise') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      }

      noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      noiseSource.connect(gainNode);
      noiseSource.start();
    } else if (type === 'nature') {
      // Create a nature-like sound with multiple oscillators
      const frequencies = [220, 330, 440, 550];
      frequencies.forEach(freq => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq + (Math.random() * 20 - 10);
        const oscGain = audioContext.createGain();
        oscGain.gain.value = 0.05;
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
      });
    }

    return {
      context: audioContext,
      gainNode,
      stop: () => {
        if (noiseSource) noiseSource.stop();
        audioContext.close();
      },
    };
  } catch (error) {
    console.error('Failed to create audio context:', error);
    return null;
  }
}

export default function Sleep() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const audioContextRef = useRef<{ context: AudioContext; gainNode: GainNode; stop: () => void } | null>(null);

  const createSession = trpc.sleep.create.useMutation();

  useEffect(() => {
    if (audioContextRef.current?.gainNode) {
      audioContextRef.current.gainNode.gain.value = volume[0] / 100;
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

    if (audioContextRef.current) {
      audioContextRef.current.stop();
    }

    const audioSetup = createAudioContext(sound.type, volume[0] / 100);
    if (!audioSetup) {
      toast.error("Failed to play sound");
      return;
    }

    audioContextRef.current = audioSetup;
    setIsPlaying(true);
    setStartTime(new Date());
  };

  const handlePause = () => {
    if (audioContextRef.current) {
      audioContextRef.current.context.suspend();
    }
    setIsPlaying(false);
  };

  const handleStop = async () => {
    if (audioContextRef.current) {
      audioContextRef.current.stop();
      audioContextRef.current = null;
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
      if (audioContextRef.current) {
        audioContextRef.current.stop();
        audioContextRef.current = null;
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
