import { useGameFlowStore } from '../../store/useGameFlowStore';
import { useMissionStore } from '../../store/useMissionStore';
import { STAGE_1_MISSIONS } from '../../core/missions/stage1Missions';
import { STAGE_2_MISSIONS } from '../../core/missions/stage2Missions';

export const ResultScreen = () => {
  const { mission, executionResult, goToProgramming, resetFlow } = useGameFlowStore();
  const { setCurrentMission } = useMissionStore();

  if (!mission || !executionResult) return null;

  const allMissions = [...STAGE_1_MISSIONS, ...STAGE_2_MISSIONS];
  const currentIndex = allMissions.findIndex(m => m.id === mission.id);
  const nextMission = currentIndex >= 0 && currentIndex < allMissions.length - 1
    ? allMissions[currentIndex + 1]
    : null;

  const handleRetry = () => {
    // КРИТИЧЕСКИ ВАЖНО: Сбрасываем миссию к исходному состоянию перед повторной попыткой
    const { resetMissionToInitial } = useGameFlowStore.getState();
    resetMissionToInitial();
    goToProgramming();
  };

  const handleNextMission = () => {
    if (nextMission) {
      // Сначала сбрасываем текущий flow
      resetFlow();
      // Затем устанавливаем новую миссию (это вызовет startMission через useEffect в MissionView)
      setCurrentMission(nextMission);
    }
  };

  const handleMainMenu = () => {
    setCurrentMission(null);
    resetFlow();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-deep-blue text-white p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Заголовок */}
        <div className="text-center mb-8">
          {executionResult.success ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-5xl font-heading font-bold mb-4 text-bright-cyan">
                Миссия выполнена!
              </h1>
              <p className="text-xl text-gray-300">Отличная работа, Инженер!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-5xl font-heading font-bold mb-4 text-error-red">
                Миссия провалена
              </h1>
              <p className="text-xl text-gray-300">Не расстраивайся, попробуй ещё раз!</p>
            </>
          )}
        </div>

        {/* Звёзды */}
        {executionResult.success && (
          <div className="flex justify-center gap-4 mb-8">
            {[1, 2, 3].map(star => (
              <div
                key={star}
                className={`text-6xl transition-all ${
                  star <= executionResult.stars
                    ? 'text-warning-yellow scale-110'
                    : 'text-gray-600 scale-90'
                }`}
              >
                ⭐
              </div>
            ))}
          </div>
        )}

        {/* Статистика */}
        <div className="mb-8 p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
          <h2 className="text-2xl font-heading mb-4 text-bright-cyan">📊 Статистика</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📏</span>
              <div>
                <div className="text-sm text-gray-400">Дистанция</div>
                <div className="text-xl font-bold">{executionResult.statistics.distance} клеток</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-sm text-gray-400">Энергия</div>
                <div className="text-xl font-bold">{Math.round(executionResult.statistics.energyLeft)}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <div className="text-sm text-gray-400">Блоков использовано</div>
                <div className="text-xl font-bold">
                  {executionResult.statistics.blocksUsed}
                  {mission.constraints?.nodeLimit && ` / ${mission.constraints.nodeLimit}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">⏱️</span>
              <div>
                <div className="text-sm text-gray-400">Время</div>
                <div className="text-xl font-bold">{executionResult.statistics.executionTime}с</div>
              </div>
            </div>
          </div>
        </div>

        {/* Цели */}
        <div className="mb-8 p-6 bg-deep-blue/50 rounded-lg border border-warning-yellow/30">
          <h2 className="text-2xl font-heading mb-4 text-warning-yellow">🎯 Цели миссии</h2>
          <div className="space-y-3">
            {mission.objectives.map(objective => {
              const completed = executionResult.objectives[objective.id];
              return (
                <div key={objective.id} className="flex items-center gap-3">
                  <span className={`text-2xl ${completed ? 'text-green-500' : 'text-gray-500'}`}>
                    {completed ? '✅' : '❌'}
                  </span>
                  <span className={completed ? 'text-white' : 'text-gray-400'}>
                    {objective.description}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Награды */}
        {executionResult.success && mission.rewards && (
          <div className="mb-8 p-6 bg-gradient-to-r from-warning-yellow/20 to-bright-orange/20 rounded-lg border border-warning-yellow/50">
            <h2 className="text-2xl font-heading mb-4 text-warning-yellow">🎁 Награды</h2>
            <div className="flex items-center gap-6">
              {mission.rewards.credits && (
                <div className="flex items-center gap-2">
                  <span className="text-4xl">💰</span>
                  <span className="text-2xl font-bold text-warning-yellow">
                    +{mission.rewards.credits}
                  </span>
                  <span className="text-gray-400">кредитов</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleMainMenu}
            className="px-6 py-3 bg-dark-purple text-white rounded hover:bg-dark-purple/80 transition-colors border border-bright-cyan/30"
          >
            🏠 Главное меню
          </button>
          
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-bright-cyan/20 text-bright-cyan rounded hover:bg-bright-cyan/30 transition-colors border border-bright-cyan"
          >
            🔄 Попробовать снова
          </button>

          {executionResult.success && nextMission && (
            <button
              onClick={handleNextMission}
              className="px-8 py-3 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-bold rounded hover:scale-105 transition-transform"
            >
              ➡️ Следующая миссия
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
