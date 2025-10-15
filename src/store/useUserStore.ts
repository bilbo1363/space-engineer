import { create } from 'zustand';
import { MissionProgress } from '../types/missions';

interface UserProfile {
  username: string;
  currentStage: number;
  completedMissions: string[];
  totalStars: number;
  totalXp: number;
  level: number;
}

interface UserStatistics {
  totalPlaytime: number;
  programsWritten: number;
  nodesUsed: number;
  bugsFixed: number;
  perfectMissions: number;
  hintsUsed: number;
}

interface UserSettings {
  musicVolume: number;
  sfxVolume: number;
  animationSpeed: number;
  accessibility: {
    colorblindMode: boolean;
    highContrast: boolean;
    textSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
  };
}

interface UserState {
  profile: UserProfile;
  statistics: UserStatistics;
  settings: UserSettings;
  missionProgress: Record<string, MissionProgress>;
  
  // Actions
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateStatistics: (stats: Partial<UserStatistics>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateMissionProgress: (missionId: string, progress: Partial<MissionProgress>) => void;
  getMissionProgress: (missionId: string) => MissionProgress | undefined;
}

const defaultProfile: UserProfile = {
  username: 'Инженер',
  currentStage: 1,
  completedMissions: [],
  totalStars: 0,
  totalXp: 0,
  level: 1,
};

const defaultStatistics: UserStatistics = {
  totalPlaytime: 0,
  programsWritten: 0,
  nodesUsed: 0,
  bugsFixed: 0,
  perfectMissions: 0,
  hintsUsed: 0,
};

const defaultSettings: UserSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  animationSpeed: 1,
  accessibility: {
    colorblindMode: false,
    highContrast: false,
    textSize: 'medium',
    reducedMotion: false,
  },
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: defaultProfile,
  statistics: defaultStatistics,
  settings: defaultSettings,
  missionProgress: {},

  updateProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),

  updateStatistics: (stats) =>
    set((state) => ({
      statistics: { ...state.statistics, ...stats },
    })),

  updateSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  updateMissionProgress: (missionId, progress) =>
    set((state) => ({
      missionProgress: {
        ...state.missionProgress,
        [missionId]: {
          ...state.missionProgress[missionId],
          missionId,
          ...progress,
        },
      },
    })),

  getMissionProgress: (missionId) => get().missionProgress[missionId],
}));
