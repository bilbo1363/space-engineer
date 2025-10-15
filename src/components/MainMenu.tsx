import { useMissionStore } from '../store/useMissionStore';
import { useGameStore } from '../store/useGameStore';
import { useAppStore } from '../store/useAppStore';
import { STAGE_1_MISSIONS } from '../core/missions/stage1Missions';
import { STAGE_2_MISSIONS } from '../core/missions/stage2Missions';

export const MainMenu = () => {
  const { setCurrentMission } = useMissionStore();
  const { setCurrentScreen } = useAppStore();

  const ALL_MISSIONS = [...STAGE_1_MISSIONS, ...STAGE_2_MISSIONS];

  const handleStartMission = (missionId: string) => {
    const mission = ALL_MISSIONS.find(m => m && m.id === missionId);
    if (mission) {
      // Очищаем программу и сбрасываем робота
      useGameStore.getState().setProgram([]);
      useGameStore.getState().setRobotState({
        position: [mission.startPosition.x, mission.startPosition.y],
        direction: mission.startPosition.direction,
        energy: 100,
        inventory: [],
      });
      
      setCurrentMission(mission);
      setCurrentScreen('mission');
    }
  };

  // Проверка что миссии загружены
  if (!ALL_MISSIONS || ALL_MISSIONS.length === 0) {
    return (
      <div className="min-h-screen bg-deep-blue text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl mb-4">⚠️ Загрузка миссий...</h1>
          <p>Миссии не найдены</p>
        </div>
      </div>
    );
  }

  const handleBackToMenu = () => {
    setCurrentScreen('mainMenu');
  };

  return (
    <div className="h-screen bg-deep-blue text-white overflow-y-auto">
      <div className="p-8">
      {/* Кнопка назад */}
      <div className="mb-6">
        <button
          onClick={handleBackToMenu}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
        >
          ← Главное меню
        </button>
      </div>

      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-bold mb-4 text-bright-cyan">
          Выбор миссии
        </h1>
        <p className="text-xl text-gray-300">Выберите миссию для прохождения</p>
      </div>

      {/* Карта миссий */}
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Этап 1 */}
        <div>
          <h2 className="text-3xl font-heading mb-6">Этап 1: Основы движения</h2>
          
          <div className="space-y-4">
            {STAGE_1_MISSIONS.map((mission) => {
              if (!mission || !mission.id) {
                return null;
              }

              return (
                <div
                  key={mission.id}
                  onClick={() => handleStartMission(mission.id)}
                  className="p-6 rounded-lg border-2 border-bright-cyan bg-dark-purple/50 hover:bg-bright-cyan/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-bright-orange">
                          {mission.stage}.{mission.order}
                        </span>
                        <h3 className="text-xl font-heading">{mission.title}</h3>
                      </div>
                      <p className="text-gray-300 mt-2 text-sm line-clamp-2">{mission.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span>⏱️ ~{mission.estimatedTime} мин</span>
                        <span>🎯 {mission.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Этап 2 */}
        <div>
          <h2 className="text-3xl font-heading mb-6 flex items-center gap-3">
            <span>Этап 2: Циклы и условия</span>
            <span className="text-sm bg-warning-yellow/20 text-warning-yellow px-3 py-1 rounded">НОВОЕ!</span>
          </h2>
          
          <div className="space-y-4">
            {STAGE_2_MISSIONS.map((mission) => {
              if (!mission || !mission.id) {
                return null;
              }

              return (
                <div
                  key={mission.id}
                  onClick={() => handleStartMission(mission.id)}
                  className="p-6 rounded-lg border-2 border-warning-yellow bg-dark-purple/50 hover:bg-warning-yellow/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-warning-yellow">
                          {mission.stage}.{mission.order}
                        </span>
                        <h3 className="text-xl font-heading">{mission.title}</h3>
                      </div>
                      <p className="text-gray-300 mt-2 text-sm line-clamp-2">{mission.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                        <span>⏱️ ~{mission.estimatedTime} мин</span>
                        <span>🎯 {mission.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
