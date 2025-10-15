import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PlayerProfile } from '../../types/game';

export const ProfileScreen = () => {
  const { currentProfile, setCurrentProfile, setCurrentScreen } = useAppStore();
  const [name, setName] = useState(currentProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile?.avatar || '🤖');

  const avatars = ['🤖', '👨‍🚀', '👩‍🚀', '🧑‍🔬', '👨‍💻', '👩‍💻', '🦾', '🛸'];

  const handleSave = () => {
    if (!name.trim()) {
      alert('Введите имя!');
      return;
    }

    if (currentProfile) {
      // Обновляем существующий профиль
      setCurrentProfile({
        ...currentProfile,
        name: name.trim(),
        avatar: selectedAvatar,
      });
    } else {
      // Создаём новый профиль
      const newProfile: PlayerProfile = {
        id: `player_${Date.now()}`,
        name: name.trim(),
        avatar: selectedAvatar,
        level: 1,
        experience: 0,
        credits: 0,
        completedMissions: [],
        unlockedRobots: ['pioneer'],
        createdAt: new Date(),
        lastPlayed: new Date(),
      };
      setCurrentProfile(newProfile);
      
      // Показываем сюжетное вступление для нового игрока
      setCurrentScreen('story');
      return;
    }

    setCurrentScreen('mainMenu');
  };

  const handleBack = () => {
    setCurrentScreen('mainMenu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-heading font-bold mb-4 text-bright-cyan">
            {currentProfile ? 'Редактировать профиль' : 'Создать профиль'}
          </h1>
          <p className="text-gray-400">
            {currentProfile 
              ? 'Измените свой профиль космического инженера'
              : 'Создайте своего космического инженера'
            }
          </p>
        </div>

        {/* Форма */}
        <div className="space-y-8">
          {/* Аватар */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <label className="block text-lg font-bold mb-4 text-bright-cyan">
              Выберите аватар
            </label>
            <div className="grid grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`
                    p-6 text-6xl rounded-lg border-2 transition-all hover:scale-110
                    ${selectedAvatar === avatar
                      ? 'border-bright-cyan bg-bright-cyan/20 scale-110'
                      : 'border-bright-cyan/30 bg-deep-blue/30 hover:border-bright-cyan/60'
                    }
                  `}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Имя */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <label className="block text-lg font-bold mb-4 text-bright-cyan">
              Ваше имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя..."
              maxLength={20}
              className="w-full px-4 py-3 bg-deep-blue border-2 border-bright-cyan/50 rounded text-white text-xl focus:outline-none focus:border-bright-cyan"
            />
            <div className="mt-2 text-sm text-gray-400">
              {name.length}/20 символов
            </div>
          </div>

          {/* Статистика (только для существующего профиля) */}
          {currentProfile && (
            <div className="p-6 bg-deep-blue/50 rounded-lg border border-warning-yellow/30">
              <h3 className="text-lg font-bold mb-4 text-warning-yellow">📊 Статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-deep-blue/50 rounded">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold">{currentProfile.level}</div>
                  <div className="text-sm text-gray-400">Уровень</div>
                </div>
                <div className="p-4 bg-deep-blue/50 rounded">
                  <div className="text-3xl mb-2">💎</div>
                  <div className="text-2xl font-bold">{currentProfile.experience}</div>
                  <div className="text-sm text-gray-400">Опыт</div>
                </div>
                <div className="p-4 bg-deep-blue/50 rounded">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold">{currentProfile.completedMissions.length}</div>
                  <div className="text-sm text-gray-400">Миссий выполнено</div>
                </div>
                <div className="p-4 bg-deep-blue/50 rounded">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold">{currentProfile.credits}</div>
                  <div className="text-sm text-gray-400">Кредитов</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 mt-12">
          <button
            onClick={handleBack}
            className="flex-1 px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {currentProfile ? 'Сохранить' : 'Создать профиль'} →
          </button>
        </div>
      </div>
    </div>
  );
};
