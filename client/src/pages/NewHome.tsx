import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Star, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { getJournalStreak, getCuddlesCount, incrementCuddles, resetDailyCuddles } from "@/lib/localStorage";

// BTS Quotes Component
function BTSQuote() {
  const btsQuotes = [
    { quote: "Don't be trapped in someone else's dream.", member: "V (Taehyung)", color: "from-purple-500 to-pink-500" },
    { quote: "Love yourself, love myself, peace.", member: "RM", color: "from-purple-400 to-purple-600" },
    { quote: "Teamwork makes the dream work.", member: "Jin", color: "from-pink-400 to-purple-500" },
    { quote: "If you don't work hard, there won't be good results.", member: "J-Hope", color: "from-orange-400 to-pink-500" },
    { quote: "I do believe your galaxy is inside you.", member: "Jimin", color: "from-blue-400 to-purple-500" },
    { quote: "Life is tough, and things don't always work out well, but we should be brave and go on with our lives.", member: "Suga", color: "from-gray-500 to-purple-500" },
    { quote: "Effort makes you. You will regret someday if you don't do your best now.", member: "Jungkook", color: "from-purple-500 to-pink-600" },
  ];

  const [currentQuote] = useState(btsQuotes[Math.floor(Math.random() * btsQuotes.length)]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${currentQuote.color} rounded-3xl p-6 shadow-lg text-white`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 fill-white" />
        <p className="text-sm opacity-90">Daily Inspiration from {currentQuote.member.split(' ')[0]}</p>
      </div>
      <p className="text-xl font-medium mb-2">"{currentQuote.quote}"</p>
      <p className="text-sm opacity-90">— {currentQuote.member}</p>
    </motion.div>
  );
}

// Interactive Cat Component
function InteractiveCat({ journalStreak }: { journalStreak: number }) {
  const [mood, setMood] = useState<'happy' | 'sleepy' | 'playful' | 'loving'>('happy');
  const [cuddles, setCuddles] = useState(() => {
    resetDailyCuddles();
    return getCuddlesCount();
  });
  const [showHearts, setShowHearts] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const catMoods = {
    happy: { face: '😺', color: 'from-purple-400 to-purple-500', message: 'Rani is happy!' },
    sleepy: { face: '😴', color: 'from-indigo-400 to-indigo-500', message: 'Rani is sleepy...' },
    playful: { face: '😸', color: 'from-pink-400 to-pink-500', message: 'Rani wants to play!' },
    loving: { face: '😻', color: 'from-purple-500 to-pink-500', message: 'Rani loves you!' },
  };

  const handleCatPress = () => {
    setIsPressing(true);
    setShowHearts(true);
    const newCount = incrementCuddles();
    setCuddles(newCount);
    setMood('loving');
    setTimeout(() => setShowHearts(false), 1000);
  };

  const handleCatRelease = () => {
    setIsPressing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const moods: Array<'happy' | 'sleepy' | 'playful' | 'loving'> = ['happy', 'sleepy', 'playful'];
      setMood(moods[Math.floor(Math.random() * moods.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentMood = catMoods[mood];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="text-center space-y-4">
        {journalStreak > 0 && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
            <span className="text-purple-700">{journalStreak} day streak!</span>
          </div>
        )}

        <div className="relative inline-block">
          <motion.button
            onMouseDown={handleCatPress}
            onMouseUp={handleCatRelease}
            onTouchStart={handleCatPress}
            onTouchEnd={handleCatRelease}
            animate={{
              scale: isPressing ? 0.95 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`w-48 h-48 rounded-full bg-gradient-to-br ${currentMood.color} flex items-center justify-center text-8xl shadow-xl relative overflow-hidden`}
          >
            {currentMood.face}
            
            {showHearts && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 1, y: 0, x: 0 }}
                    animate={{
                      opacity: 0,
                      y: -100,
                      x: (Math.random() - 0.5) * 100,
                    }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="absolute top-1/2 left-1/2"
                  >
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  </motion.div>
                ))}
              </>
            )}
          </motion.button>

          <div className="absolute -top-2 -right-2 text-2xl">🐾</div>
          <div className="absolute -bottom-2 -left-2 text-2xl">🐾</div>
        </div>

        <div>
          <p className="text-purple-700 font-medium">{currentMood.message}</p>
          <p className="text-sm text-gray-600 mt-1">
            Tap & hold Rani to give cuddles
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 bg-purple-50 rounded-full px-4 py-2 inline-flex">
          <span className="text-2xl">🤗</span>
          <span className="text-purple-700">{cuddles} cuddles today</span>
        </div>

        <div className="pt-4 border-t border-purple-100">
          <p className="text-gray-700 mb-3 font-medium">Paw Stickers</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {cuddles >= 5 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-full text-sm"
              >
                😺 Calm Set
              </motion.div>
            ) : null}
            {cuddles >= 10 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm"
              >
                ✨ Super Calm
              </motion.div>
            ) : null}
            {cuddles >= 20 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm"
              >
                💜 BTS Army
              </motion.div>
            ) : null}
            {cuddles < 5 && (
              <p className="text-sm text-gray-500">Give Rani 5 cuddles to unlock stickers!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ activeTab }: { activeTab: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
        <Link href="/">
          <button
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'home' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Home</span>
          </button>
        </Link>
        <Link href="/calm">
          <button
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'calm' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">🧘</span>
            <span className="text-xs">Calm</span>
          </button>
        </Link>
        <Link href="/journal">
          <button
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'journal' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">✨</span>
            <span className="text-xs">Journal</span>
          </button>
        </Link>
        <Link href="/my-journeys">
          <button
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'mood' ? 'bg-purple-100 text-purple-600' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">💜</span>
            <span className="text-xs">Mood</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default function NewHome() {
  const [location] = useLocation();
  const [journalStreak, setJournalStreak] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Get journal streak from localStorage
    setJournalStreak(getJournalStreak());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Purple Calm ✨
            </h1>
            <p className="text-purple-600 text-sm">Your cozy cat comfort space</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6 text-purple-600" />
            ) : (
              <Moon className="w-6 h-6 text-purple-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <BTSQuote />
        <InteractiveCat journalStreak={journalStreak} />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/calm">
            <button className="bg-gradient-to-br from-purple-400 to-purple-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full">
              <div className="text-3xl mb-2">🫁</div>
              <div className="font-medium">Breathe</div>
              <div className="text-xs opacity-90">4-4-4 Exercise</div>
            </button>
          </Link>
          <Link href="/my-journeys">
            <button className="bg-gradient-to-br from-pink-400 to-pink-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full">
              <div className="text-3xl mb-2">💜</div>
              <div className="font-medium">Mood</div>
              <div className="text-xs opacity-90">Track feelings</div>
            </button>
          </Link>
          <Link href="/journal">
            <button className="bg-gradient-to-br from-indigo-400 to-indigo-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full">
              <div className="text-3xl mb-2">📝</div>
              <div className="font-medium">Journal</div>
              <div className="text-xs opacity-90">{journalStreak} day streak</div>
            </button>
          </Link>
          <Link href="/migraine">
            <button className="bg-gradient-to-br from-violet-400 to-violet-500 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full">
              <div className="text-3xl mb-2">🩺</div>
              <div className="font-medium">Migraine</div>
              <div className="text-xs opacity-90">Log & track</div>
            </button>
          </Link>
        </div>

        {/* Sleep Support Link */}
        <Link href="/sleep">
          <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-700 font-medium">Sleep Support</h3>
                <p className="text-sm text-gray-600">Calming sounds for rest</p>
              </div>
              <span className="text-3xl">🌙</span>
            </div>
          </div>
        </Link>

        {/* Cat Chat Link */}
        <Link href="/chat">
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">😺</span>
              <h3 className="text-white font-medium text-lg">Chat with Rani</h3>
            </div>
            <p className="text-white/90">A gentle place to talk and share</p>
          </div>
        </Link>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
