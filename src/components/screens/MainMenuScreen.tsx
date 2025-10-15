import { useAppStore } from '../../store/useAppStore';

export const MainMenuScreen = () => {
  const { currentProfile, setCurrentScreen } = useAppStore();

  const menuItems = [
    {
      id: 'new',
      label: currentProfile ? 'Продолжить' : 'Новая игра',
      icon: '▶️',
      action: () => {
        if (currentProfile) {
          setCurrentScreen('missionSelect');
        } else {
          setCurrentScreen('profile');
        }
      },
      primary: true,
    },
    {
      id: 'load',
      label: 'Загрузить',
      icon: '📂',
      action: () => {
        // TODO: Реализовать загрузку сохранений
        alert('Загрузка сохранений будет реализована позже');
      },
      disabled: !currentProfile,
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: '👤',
      action: () => setCurrentScreen('profile'),
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: '⚙️',
      action: () => setCurrentScreen('settings'),
    },
    {
      id: 'exit',
      label: 'Выход',
      icon: '🚪',
      action: () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
          window.close();
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-black text-white flex">
      {/* Левая панель - Декоративная */}
      <div className="w-1/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-deep-blue/50" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-10">
          🤖
        </div>
      </div>

      {/* Правая панель - Меню */}
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-bright-cyan to-bright-orange bg-clip-text text-transparent">
            SPACE ENGINEER
          </h1>
          {currentProfile && (
            <p className="text-xl text-gray-400">
              Добро пожаловать, <span className="text-bright-cyan">{currentProfile.name}</span>!
            </p>
          )}
        </div>

        {/* Меню */}
        <div className="space-y-4 w-full max-w-md">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              disabled={item.disabled}
              className={`
                w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4
                ${item.primary
                  ? 'bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue border-transparent font-bold text-xl hover:scale-105'
                  : 'bg-deep-blue/50 border-bright-cyan/30 hover:border-bright-cyan hover:bg-deep-blue/70'
                }
                ${item.disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:border-bright-cyan/30' : ''}
              `}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {!item.disabled && !item.primary && (
                <span className="text-bright-cyan">→</span>
              )}
            </button>
          ))}
        </div>

        {/* Статистика профиля */}
        {currentProfile && (
          <div className="mt-12 p-6 bg-deep-blue/30 rounded-lg border border-bright-cyan/30 w-full max-w-md">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl text-warning-yellow">⭐</div>
                <div className="text-2xl font-bold">{currentProfile.level}</div>
                <div className="text-xs text-gray-400">Уровень</div>
              </div>
              <div>
                <div className="text-3xl text-bright-cyan">🎯</div>
                <div className="text-2xl font-bold">{currentProfile.completedMissions.length}</div>
                <div className="text-xs text-gray-400">Миссий</div>
              </div>
              <div>
                <div className="text-3xl text-bright-orange">💰</div>
                <div className="text-2xl font-bold">{currentProfile.credits}</div>
                <div className="text-xs text-gray-400">Кредитов</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Версия */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-500">
        v0.1.0 Alpha
      </div>
    </div>
  );
};
