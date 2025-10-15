// Глобальные экраны игры
export type GameScreen = 
  | 'start'           // Заставка при запуске
  | 'mainMenu'        // Главное меню
  | 'profile'         // Профиль игрока
  | 'settings'        // Настройки
  | 'story'           // Сюжетный экран
  | 'missionSelect'   // Выбор миссии
  | 'mission';        // Игровой процесс миссии

// Профиль игрока
export interface PlayerProfile {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  experience: number;
  credits: number;
  completedMissions: string[];
  unlockedRobots: string[];
  createdAt: Date;
  lastPlayed: Date;
}

// Настройки игры
export interface GameSettings {
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  graphics: {
    quality: 'low' | 'medium' | 'high';
    shadows: boolean;
    antialiasing: boolean;
  };
  gameplay: {
    tutorialEnabled: boolean;
    autoSave: boolean;
    language: 'ru' | 'en';
  };
}

// Сюжетный момент
export interface StoryMoment {
  id: string;
  title: string;
  content: string;
  character?: 'aria' | 'player' | 'commander';
  image?: string;
  choices?: StoryChoice[];
  nextMoment?: string;
  unlocksMission?: string;
}

export interface StoryChoice {
  text: string;
  nextMoment: string;
}

// Сохранение игры
export interface GameSave {
  profile: PlayerProfile;
  settings: GameSettings;
  currentStoryMoment?: string;
  timestamp: Date;
}
