import { useGameFlowStore } from '../store/useGameFlowStore';
import { BriefingScreen } from './screens/BriefingScreen';
import { ProgrammingScreen } from './screens/ProgrammingScreen';
import { ExecutionScreen } from './screens/ExecutionScreen';
import { ResultScreen } from './screens/ResultScreen';

export const GameFlow = () => {
  const { stage } = useGameFlowStore();

  switch (stage) {
    case 'briefing':
      return <BriefingScreen />;
    case 'programming':
      return <ProgrammingScreen />;
    case 'execution':
      return <ExecutionScreen />;
    case 'result':
      return <ResultScreen />;
    default:
      return <BriefingScreen />;
  }
};
