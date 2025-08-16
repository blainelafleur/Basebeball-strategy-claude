'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Trophy } from 'lucide-react';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements';

interface AchievementNotificationProps {
  achievementIds: string[];
  onClose: () => void;
}

export function AchievementNotification({ achievementIds, onClose }: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const achievements = achievementIds
    .map((id) => ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id))
    .filter(Boolean);

  useEffect(() => {
    if (achievements.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }, 4000); // Show each achievement for 4 seconds

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onClose]);

  if (!isVisible || achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];
  if (!currentAchievement) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'diamond':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'diamond':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.6,
          }}
        >
          <Card
            className={`w-80 bg-gradient-to-r ${getTierGradient(currentAchievement.tier)} border-0 shadow-2xl`}
          >
            <CardContent className="p-0">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg relative">
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTierGradient(currentAchievement.tier)} flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {currentAchievement.icon}
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">Achievement Unlocked!</h3>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-1">{currentAchievement.name}</h4>

                    <p className="text-sm text-gray-600 mb-3">{currentAchievement.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge className={getTierColor(currentAchievement.tier)}>
                        {currentAchievement.tier.charAt(0).toUpperCase() +
                          currentAchievement.tier.slice(1)}
                      </Badge>

                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-yellow-600">
                          +{currentAchievement.points}
                        </span>
                        <span className="text-sm text-gray-500">XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {achievements.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-1">
                    {achievements.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-lg"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4, ease: 'linear' }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
