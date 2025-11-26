import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';

interface InteractiveCatProps {
  journalStreak: number;
}

export function InteractiveCat({ journalStreak }: InteractiveCatProps) {
  const [mood, setMood] = useState<'happy' | 'sleepy' | 'playful' | 'loving'>('happy');
  const [cuddles, setCuddles] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const catMoods = {
    happy: { face: '😺', color: 'from-purple-400 to-purple-500', message: 'Mochi is happy!' },
    sleepy: { face: '😴', color: 'from-indigo-400 to-indigo-500', message: 'Mochi is sleepy...' },
    playful: { face: '😸', color: 'from-pink-400 to-pink-500', message: 'Mochi wants to play!' },
    loving: { face: '😻', color: 'from-purple-500 to-pink-500', message: 'Mochi loves you!' },
  };

  const handleCatPress = () => {
    setIsPressing(true);
    setShowHearts(true);
    setCuddles(prev => prev + 1);
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
        {/* Streak Badge */}
        {journalStreak > 0 && (
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
            <span className="text-purple-700">{journalStreak} day streak!</span>
          </div>
        )}

        {/* Cat Circle */}
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
            
            {/* Floating Hearts */}
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

          {/* Paw prints decoration */}
          <div className="absolute -top-2 -right-2 text-2xl">🐾</div>
          <div className="absolute -bottom-2 -left-2 text-2xl">🐾</div>
        </div>

        {/* Status */}
        <div>
          <p className="text-purple-700">{currentMood.message}</p>
          <p className="text-sm text-gray-600 mt-1">
            Tap & hold Mochi to give cuddles
          </p>
        </div>

        {/* Cuddle Counter */}
        <div className="flex items-center justify-center gap-2 bg-purple-50 rounded-full px-4 py-2 inline-flex">
          <span className="text-2xl">🤗</span>
          <span className="text-purple-700">{cuddles} cuddles today</span>
        </div>

        {/* Paw Stickers Section */}
        <div className="pt-4 border-t border-purple-100">
          <p className="text-gray-700 mb-3">Paw Stickers</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {cuddles >= 5 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-full text-sm"
              >
                😺 Calm Set
              </motion.div>
            )}
            {cuddles >= 10 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm"
              >
                ✨ Super Calm
              </motion.div>
            )}
            {cuddles >= 20 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm"
              >
                💜 BTS Army
              </motion.div>
            )}
            {cuddles < 5 && (
              <p className="text-sm text-gray-500">Give Mochi 5 cuddles to unlock stickers!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
