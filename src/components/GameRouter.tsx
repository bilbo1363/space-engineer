import { useAppStore } from '../store/useAppStore';
import { StartScreen } from './screens/StartScreen';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StoryScreen } from './screens/StoryScreen';
import { MainMenu } from './MainMenu';
import { MissionView } from './MissionView';

export const GameRouter = () => {
  const { currentScreen } = useAppStore();

  switch (currentScreen) {
    case 'start':
      return <StartScreen />;
    case 'mainMenu':
      return <MainMenuScreen />;
    case 'profile':
      return <ProfileScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'story':
      return <StoryScreen />;
    case 'missionSelect':
      return <MainMenu />;
    case 'mission':
      return <MissionView />;
    default:
      return <StartScreen />;
  }
};
