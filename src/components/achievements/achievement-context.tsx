'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AchievementNotification } from './achievement-notification';

interface AchievementContextType {
  showAchievements: (achievementIds: string[]) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([]);

  const showAchievements = useCallback((achievementIds: string[]) => {
    if (achievementIds.length > 0) {
      setPendingAchievements(achievementIds);
    }
  }, []);

  const handleClose = useCallback(() => {
    setPendingAchievements([]);
  }, []);

  return (
    <AchievementContext.Provider value={{ showAchievements }}>
      {children}
      {pendingAchievements.length > 0 && (
        <AchievementNotification achievementIds={pendingAchievements} onClose={handleClose} />
      )}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
