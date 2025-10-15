import { useEffect } from 'react';
import { useMissionStore } from '../store/useMissionStore';
import { useGameFlowStore } from '../store/useGameFlowStore';
import { MainMenu } from './MainMenu';
import { GameFlow } from './GameFlow';

export const MissionView = () => {
  const { currentMission } = useMissionStore();
  const { startMission } = useGameFlowStore();

  // Когда миссия выбрана, инициализируем GameFlow
  useEffect(() => {
    if (currentMission) {
      startMission(currentMission);
    }
  }, [currentMission, startMission]);

  if (!currentMission) {
    return <MainMenu />;
  }

  return <GameFlow />;
};
