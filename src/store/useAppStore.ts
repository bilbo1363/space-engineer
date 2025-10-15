import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameScreen, PlayerProfile, GameSettings } from '../types/game';

interface AppState {
  // Навигация
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;

  // Профиль
  currentProfile: PlayerProfile | null;
  setCurrentProfile: (profile: PlayerProfile | null) => void;
  updateProfile: (updates: Partial<PlayerProfile>) => void;

  // Настройки
  settings: GameSettings;
  updateSettings: (updates: Partial<GameSettings>) => void;

  // Сюжет
  currentStoryMoment: string | null;
  setCurrentStoryMoment: (momentId: string | null) => void;
  completedStoryMoments: string[];
  addCompletedStoryMoment: (momentId: string) => void;

  // Утилиты
  reset: () => void;
}

const defaultSettings: GameSettings = {
  audio: {
    masterVolume: 1,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false,
  },
  graphics: {
    quality: 'high',
    shadows: true,
    antialiasing: true,
  },
  gameplay: {
    tutorialEnabled: true,
    autoSave: true,
    language: 'ru',
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      currentScreen: 'start',
      currentProfile: null,
      settings: defaultSettings,
      currentStoryMoment: null,
      completedStoryMoments: [],

      // Навигация
      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      // Профиль
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      
      updateProfile: (updates) => {
        const current = get().currentProfile;
        if (current) {
          set({
            currentProfile: {
              ...current,
              ...updates,
              lastPlayed: new Date(),
            },
          });
        }
      },

      // Настройки
      updateSettings: (updates) => {
        set({
          settings: {
            ...get().settings,
            ...updates,
          },
        });
      },

      // Сюжет
      setCurrentStoryMoment: (momentId) => set({ currentStoryMoment: momentId }),
      
      addCompletedStoryMoment: (momentId) => {
        const completed = get().completedStoryMoments;
        if (!completed.includes(momentId)) {
          set({ completedStoryMoments: [...completed, momentId] });
        }
      },

      // Сброс
      reset: () => set({
        currentScreen: 'start',
        currentProfile: null,
        settings: defaultSettings,
        currentStoryMoment: null,
        completedStoryMoments: [],
      }),
    }),
    {
      name: 'space-engineer-app',
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        settings: state.settings,
        completedStoryMoments: state.completedStoryMoments,
      }),
    }
  )
);
