import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: {
    inning: string;
    score: string;
    count: string;
    runners: string;
  };
  options: string[];
  bestChoice: string;
  explanations: Record<string, string>;
  successRates: Record<string, number>;
}

export interface PlayerStats {
  points: number;
  streak: number;
  level: 'Rookie' | 'Pro' | 'All-Star';
  gamesPlayed: number;
  correctDecisions: number;
  successRate: number;
}

export interface GameState {
  selectedPosition: string;
  currentScenario: Scenario | null;
  scenarioStartTime: number | null;
  playerStats: PlayerStats;
  isPlaying: boolean;
  showOutcome: boolean;
  lastOutcome: {
    category: 'success' | 'warning' | 'danger';
    success: boolean;
    isOptimal: boolean;
    explanation: string;
    points: number;
    successRate: number;
    decisionTime: number;
  } | null;
}

export interface GameActions {
  selectPosition: (position: string) => void;
  setCurrentScenario: (scenario: Scenario) => void;
  startScenario: () => void;
  makeDecision: (decision: string) => void;
  updateStats: (success: boolean, points: number) => void;
  startNewScenario: () => void;
  resetGame: () => void;
}

const initialStats: PlayerStats = {
  points: 0,
  streak: 0,
  level: 'Rookie',
  gamesPlayed: 0,
  correctDecisions: 0,
  successRate: 0,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // State
      selectedPosition: '',
      currentScenario: null,
      scenarioStartTime: null,
      playerStats: initialStats,
      isPlaying: false,
      showOutcome: false,
      lastOutcome: null,

      // Actions
      selectPosition: (position: string) => {
        set({ selectedPosition: position });
      },

      setCurrentScenario: (scenario: Scenario) => {
        set({
          currentScenario: scenario,
          scenarioStartTime: Date.now(),
          isPlaying: true,
          showOutcome: false,
        });
      },

      startScenario: () => {
        set({
          scenarioStartTime: Date.now(),
          isPlaying: true,
          showOutcome: false,
        });
      },

      makeDecision: async (decision: string) => {
        const state = get();
        const scenario = state.currentScenario;
        const startTime = state.scenarioStartTime;

        if (!scenario || !startTime) return;

        const decisionTime = (Date.now() - startTime) / 1000;
        const isOptimalChoice = decision === scenario.bestChoice;
        const successRate = scenario.successRates[decision];
        const actualSuccess = Math.random() * 100 < successRate;

        // Calculate points
        let pointsEarned = 0;
        if (actualSuccess) {
          pointsEarned = isOptimalChoice ? 15 : successRate >= 60 ? 10 : 5;
          // Time bonus for quick decisions
          if (decisionTime < 10) {
            pointsEarned += Math.max(1, Math.floor(5 - decisionTime));
          }
        }

        // Determine outcome category
        let category: 'success' | 'warning' | 'danger' = 'danger';
        if (isOptimalChoice) {
          category = 'success';
        } else if (successRate >= 60) {
          category = 'warning';
        }

        const outcome = {
          category,
          success: actualSuccess,
          isOptimal: isOptimalChoice,
          explanation: scenario.explanations[decision],
          points: pointsEarned,
          successRate,
          decisionTime,
        };

        // Save game completion to database
        try {
          const response = await fetch('/api/game/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scenarioId: scenario.id,
              success: actualSuccess,
              points: pointsEarned,
              responseTime: decisionTime,
              difficulty: 'INTERMEDIATE', // TODO: Get from scenario
              category: state.selectedPosition,
              playerChoice: decision,
              isOptimal: isOptimalChoice,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Update local stats with server response
            if (data.user) {
              set((currentState) => ({
                playerStats: {
                  ...currentState.playerStats,
                  points: data.user.points,
                  streak: data.user.currentStreak,
                  level: data.user.level || currentState.playerStats.level,
                },
              }));
            }
            
            // Show achievement notifications
            if (data.achievements && data.achievements.length > 0) {
              data.achievements.forEach((achievement: any) => {
                toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                  description: achievement.description,
                });
              });
            }
          } else {
            console.warn('Failed to save game to database:', response.statusText);
            // Fall back to local stats update
            get().updateStats(actualSuccess, pointsEarned);
          }
        } catch (error) {
          console.error('Error saving game:', error);
          // Fall back to local stats update
          get().updateStats(actualSuccess, pointsEarned);
          toast.error('Failed to save game progress');
        }

        set({
          showOutcome: true,
          lastOutcome: outcome,
          isPlaying: false,
        });
      },

      updateStats: (success: boolean, points: number) => {
        set((state) => {
          const newStats = { ...state.playerStats };

          newStats.gamesPlayed++;
          newStats.points += points;

          if (success) {
            newStats.correctDecisions++;
            newStats.streak++;
          } else {
            newStats.streak = 0;
          }

          // Update level based on points
          if (newStats.points >= 100) {
            newStats.level = 'All-Star';
          } else if (newStats.points >= 50) {
            newStats.level = 'Pro';
          } else {
            newStats.level = 'Rookie';
          }

          // Calculate success rate
          newStats.successRate =
            newStats.gamesPlayed > 0 ? (newStats.correctDecisions / newStats.gamesPlayed) * 100 : 0;

          return { playerStats: newStats };
        });
      },

      startNewScenario: () => {
        set({
          selectedPosition: '',
          currentScenario: null,
          scenarioStartTime: null,
          isPlaying: false,
          showOutcome: false,
          lastOutcome: null,
        });
      },

      resetGame: () => {
        set({
          selectedPosition: '',
          currentScenario: null,
          scenarioStartTime: null,
          playerStats: initialStats,
          isPlaying: false,
          showOutcome: false,
          lastOutcome: null,
        });
      },
    }),
    {
      name: 'baseball-strategy-storage',
      partialize: (state) => ({ playerStats: state.playerStats }),
    }
  )
);
