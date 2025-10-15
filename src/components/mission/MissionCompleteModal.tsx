interface MissionCompleteModalProps {
  isOpen: boolean;
  success: boolean;
  stars: number;
  onClose: () => void;
  onRetry: () => void;
  onNextMission?: () => void;
}

export const MissionCompleteModal = ({
  isOpen,
  success,
  stars,
  onClose,
  onRetry,
  onNextMission,
}: MissionCompleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-dark-purple border-2 border-bright-cyan rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-heading font-bold mb-2">
            {success ? '🎉 Миссия выполнена!' : '😔 Попробуй еще раз'}
          </h2>
          <p className="text-gray-300">
            {success 
              ? 'Отличная работа, Инженер!' 
              : 'Не расстраивайся, попробуй снова!'}
          </p>
        </div>

        {/* Звезды */}
        {success && (
          <div className="flex justify-center gap-4 mb-6">
            {[1, 2, 3].map(star => (
              <span
                key={star}
                className={`text-6xl transition-all ${
                  star <= stars 
                    ? 'text-warning-yellow animate-bounce' 
                    : 'text-gray-600'
                }`}
                style={{ animationDelay: `${star * 0.2}s` }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}

        {/* Статистика */}
        {success && (
          <div className="bg-deep-blue rounded p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-bright-cyan">{stars}</div>
                <div className="text-sm text-gray-400">Звёзд получено</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-bright-orange">+50</div>
                <div className="text-sm text-gray-400">Опыт (XP)</div>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3">
          {success ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors font-bold"
              >
                К миссиям
              </button>
              {onNextMission && (
                <button
                  onClick={onNextMission}
                  className="flex-1 px-4 py-3 bg-bright-cyan text-deep-blue rounded hover:bg-bright-orange transition-colors font-bold"
                >
                  Далее →
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors font-bold"
              >
                Выход
              </button>
              <button
                onClick={onRetry}
                className="flex-1 px-4 py-3 bg-bright-cyan text-deep-blue rounded hover:bg-bright-orange transition-colors font-bold"
              >
                🔄 Повторить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
