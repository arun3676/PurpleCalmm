import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewSleep() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGoodnightMessage, setShowGoodnightMessage] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const goodnightAudioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = [
    { name: "Winter Bear", emoji: "🐻", file: "/audio/winter_bear.mp3", color: "from-blue-400 to-indigo-500" },
    { name: "Soft Kitty", emoji: "🐱", file: "/audio/soft_kitty.mp3", color: "from-pink-400 to-purple-500" },
  ];

  useEffect(() => {
    // Preload goodnight audio
    goodnightAudioRef.current = new Audio("/audio/goodnight_ko.mp3");
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (goodnightAudioRef.current) {
        goodnightAudioRef.current.pause();
      }
    };
  }, []);

  const handleSoundClick = (sound: typeof sounds[0]) => {
    if (activeSound === sound.name && isPlaying) {
      // Pause current sound
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Stop previous sound if any
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play new sound
      audioRef.current = new Audio(sound.file);
      audioRef.current.loop = true;
      audioRef.current.play();
      setActiveSound(sound.name);
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const handleGoodnightPress = () => {
    setIsPressing(true);
  };

  const handleGoodnightRelease = () => {
    setIsPressing(false);
    
    // Play goodnight audio
    if (goodnightAudioRef.current) {
      goodnightAudioRef.current.currentTime = 0;
      goodnightAudioRef.current.play();
    }

    // Show message
    setShowGoodnightMessage(true);
    setTimeout(() => setShowGoodnightMessage(false), 3000);
  };

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSound(null);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Sleep Support 🌙</h1>
              <p className="text-sm text-purple-600">Calming sounds for rest</p>
            </div>
          </div>
          {isPlaying && (
            <Button variant="ghost" size="icon" onClick={stopAllSounds}>
              <VolumeX className="h-5 w-5 text-purple-600" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Goodnight Cat */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700 text-center">Goodnight Cat 🌙</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Press and hold Mochi to hear a special goodnight message
              </p>
              
              <div className="relative inline-block">
                <motion.button
                  onMouseDown={handleGoodnightPress}
                  onMouseUp={handleGoodnightRelease}
                  onTouchStart={handleGoodnightPress}
                  onTouchEnd={handleGoodnightRelease}
                  animate={{
                    scale: isPressing ? 0.9 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-6xl shadow-xl"
                >
                  {isPressing ? '😴' : '😺'}
                </motion.button>

                {showGoodnightMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap"
                  >
                    Good night! Sweet dreams 💜
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Tap and hold to activate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Calming Sounds */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-purple-700">Calming Sounds</CardTitle>
                <p className="text-sm text-gray-600">Peaceful soundscapes</p>
              </div>
              {isPlaying ? (
                <Volume2 className="w-5 h-5 text-purple-500" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {sounds.map((sound) => (
                <motion.button
                  key={sound.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSoundClick(sound)}
                  className={`p-4 rounded-2xl transition-all ${
                    activeSound === sound.name && isPlaying
                      ? `bg-gradient-to-br ${sound.color} text-white shadow-lg`
                      : 'bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <div className="text-3xl mb-2">{sound.emoji}</div>
                  <div className="text-sm font-medium">{sound.name}</div>
                  {activeSound === sound.name && isPlaying && (
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {activeSound && isPlaying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 bg-purple-50 rounded-xl p-3 text-center"
              >
                <p className="text-sm text-purple-700">Playing {activeSound}...</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopAllSounds}
                  className="mt-2"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Sleep Tips */}
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-700">Sleep Tips 💤</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span>Create a relaxing bedtime routine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span>Keep your bedroom cool and dark</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span>Avoid screens 30 minutes before bed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500">✓</span>
                <span>Try gentle breathing exercises</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
          <Link href="/">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">🏠</span>
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/calm">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">🧘</span>
              <span className="text-xs">Calm</span>
            </button>
          </Link>
          <Link href="/journal">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">✨</span>
              <span className="text-xs">Journal</span>
            </button>
          </Link>
          <Link href="/my-journeys">
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-gray-500">
              <span className="text-xl">💜</span>
              <span className="text-xs">Mood</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
