import { useGameFlowStore } from '../../store/useGameFlowStore';
import { useGameStore } from '../../store/useGameStore';
import { useAppStore } from '../../store/useAppStore';
import { NODE_DEFINITIONS } from '../../core/nodes/nodeDefinitions';

export const BriefingScreen = () => {
  const { mission, goToProgramming } = useGameFlowStore();
  const { setRobotState, setProgram } = useGameStore();
  const { setCurrentScreen } = useAppStore();

  if (!mission) {
    return (
      <div className="min-h-screen bg-deep-blue text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl mb-4">⚠️ Миссия не выбрана</h1>
        </div>
      </div>
    );
  }

  const handleStartMission = () => {
    // Сбрасываем состояние робота
    setRobotState({
      position: [mission.startPosition.x, mission.startPosition.y],
      direction: mission.startPosition.direction,
      energy: 100,
      inventory: [],
    });

    // Очищаем программу
    setProgram([]);

    // Переходим к программированию
    goToProgramming();
  };

  const handleBackToMissions = () => {
    setCurrentScreen('missionSelect');
  };

  // Получаем иконки доступных блоков
  const availableNodesIcons = mission.availableNodes
    .map(nodeType => NODE_DEFINITIONS[nodeType])
    .filter(Boolean)
    .map(node => node!.icon);

  return (
    <div className="h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-deep-blue text-white overflow-y-auto">
      <div className="p-8 pb-32">
        <div className="max-w-4xl mx-auto">
        {/* Кнопка назад */}
        <div className="mb-6">
          <button
            onClick={handleBackToMissions}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            ← К списку миссий
          </button>
        </div>

        {/* Заголовок миссии */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-2 bg-bright-cyan/20 rounded-full mb-4">
            <span className="text-bright-cyan font-bold">
              Этап {mission.stage} • Миссия {mission.order}
            </span>
          </div>
          <h1 className="text-5xl font-heading font-bold mb-4 text-bright-cyan">
            {mission.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>⏱️ ~{mission.estimatedTime} мин</span>
            <span>•</span>
            <span>🎯 {mission.difficulty}</span>
          </div>
        </div>

        {/* История */}
        {mission.story && (
          <div className="mb-8 p-6 bg-dark-purple/50 rounded-lg border border-bright-cyan/30">
            <div className="flex items-start gap-4">
              <div className="text-6xl">🤖</div>
              <div>
                <div className="text-bright-orange font-bold mb-2">ARIA:</div>
                <p className="text-gray-300 italic">{mission.story}</p>
              </div>
            </div>
          </div>
        )}

        {/* Описание миссии */}
        <div className="mb-8 p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
          <h2 className="text-2xl font-heading mb-4 text-bright-cyan">📋 Описание</h2>
          <p className="text-gray-300 leading-relaxed">{mission.description}</p>
        </div>

        {/* Цели */}
        <div className="mb-8 p-6 bg-deep-blue/50 rounded-lg border border-warning-yellow/30">
          <h2 className="text-2xl font-heading mb-4 text-warning-yellow">🎯 Цели миссии</h2>
          <div className="space-y-3">
            {mission.objectives.map((objective, index) => (
              <div key={objective.id} className="flex items-start gap-3">
                <span className="text-warning-yellow text-xl">
                  {objective.required ? '✓' : '○'}
                </span>
                <div>
                  <div className="font-bold">{objective.description}</div>
                  {!objective.required && (
                    <div className="text-xs text-gray-400">Опционально</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ограничения и ресурсы */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Доступные блоки */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <h3 className="text-lg font-heading mb-3 text-bright-cyan">⚡ Доступные блоки</h3>
            <div className="flex flex-wrap gap-2">
              {availableNodesIcons.map((icon, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-bright-cyan/10 rounded flex items-center justify-center text-2xl border border-bright-cyan/30"
                  title={mission.availableNodes[index]}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Ограничения */}
          {mission.constraints && (
            <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-orange/30">
              <h3 className="text-lg font-heading mb-3 text-bright-orange">⚠️ Ограничения</h3>
              <div className="space-y-2">
                {mission.constraints.nodeLimit && (
                  <div className="flex items-center gap-2">
                    <span>📦</span>
                    <span>Макс. блоков: {mission.constraints.nodeLimit}</span>
                  </div>
                )}
                {mission.constraints.energyLimit && (
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>Лимит энергии: {mission.constraints.energyLimit}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Награды */}
        {mission.rewards && (
          <div className="mb-8 p-6 bg-gradient-to-r from-warning-yellow/20 to-bright-orange/20 rounded-lg border border-warning-yellow/50">
            <h2 className="text-2xl font-heading mb-4 text-warning-yellow">🎁 Награды</h2>
            <div className="flex items-center gap-6">
              {mission.rewards.credits && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl">💰</span>
                  <span className="text-xl font-bold">+{mission.rewards.credits}</span>
                  <span className="text-gray-400">кредитов</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Подсказки */}
        {mission.hints && mission.hints.length > 0 && (
          <div className="mb-8 p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <h2 className="text-xl font-heading mb-4 text-bright-cyan">💡 Подсказки</h2>
            <div className="space-y-3">
              {mission.hints.map((hint, index) => (
                <div key={index} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-bright-cyan">•</span>
                  <span>{hint.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопка начала */}
        <div className="text-center mt-8">
          <button
            onClick={handleStartMission}
            className="px-12 py-4 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-heading text-2xl font-bold rounded-lg hover:scale-105 transition-transform shadow-lg shadow-bright-cyan/50"
          >
            ▶️ Начать миссию
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
