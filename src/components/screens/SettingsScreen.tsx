import { useAppStore } from '../../store/useAppStore';

export const SettingsScreen = () => {
  const { settings, updateSettings, setCurrentScreen } = useAppStore();

  const handleBack = () => {
    setCurrentScreen('mainMenu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-5xl font-heading font-bold mb-4 text-bright-cyan">
            ⚙️ Настройки
          </h1>
          <p className="text-gray-400">Настройте игру под себя</p>
        </div>

        <div className="space-y-6">
          {/* Аудио */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <h2 className="text-2xl font-heading mb-6 text-bright-cyan">🔊 Аудио</h2>
            
            <div className="space-y-4">
              {/* Общая громкость */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-lg">Общая громкость</label>
                  <span className="text-bright-orange">{Math.round(settings.audio.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.masterVolume * 100}
                  onChange={(e) => updateSettings({
                    audio: {
                      ...settings.audio,
                      masterVolume: parseInt(e.target.value) / 100,
                    }
                  })}
                  className="w-full"
                />
              </div>

              {/* Музыка */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-lg">Музыка</label>
                  <span className="text-bright-orange">{Math.round(settings.audio.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.musicVolume * 100}
                  onChange={(e) => updateSettings({
                    audio: {
                      ...settings.audio,
                      musicVolume: parseInt(e.target.value) / 100,
                    }
                  })}
                  className="w-full"
                />
              </div>

              {/* Звуковые эффекты */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-lg">Звуковые эффекты</label>
                  <span className="text-bright-orange">{Math.round(settings.audio.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.sfxVolume * 100}
                  onChange={(e) => updateSettings({
                    audio: {
                      ...settings.audio,
                      sfxVolume: parseInt(e.target.value) / 100,
                    }
                  })}
                  className="w-full"
                />
              </div>

              {/* Отключить звук */}
              <div className="flex items-center justify-between pt-4 border-t border-bright-cyan/20">
                <label className="text-lg">Отключить звук</label>
                <button
                  onClick={() => updateSettings({
                    audio: {
                      ...settings.audio,
                      muted: !settings.audio.muted,
                    }
                  })}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${settings.audio.muted
                      ? 'bg-error-red text-white'
                      : 'bg-bright-cyan text-deep-blue'
                    }
                  `}
                >
                  {settings.audio.muted ? '🔇 Выкл' : '🔊 Вкл'}
                </button>
              </div>
            </div>
          </div>

          {/* Графика */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <h2 className="text-2xl font-heading mb-6 text-bright-cyan">🎨 Графика</h2>
            
            <div className="space-y-4">
              {/* Качество */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Качество графики</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => updateSettings({
                        graphics: {
                          ...settings.graphics,
                          quality,
                        }
                      })}
                      className={`
                        px-4 py-2 rounded-lg transition-all
                        ${settings.graphics.quality === quality
                          ? 'bg-bright-cyan text-deep-blue font-bold'
                          : 'bg-deep-blue border border-bright-cyan/30 hover:border-bright-cyan'
                        }
                      `}
                    >
                      {quality === 'low' ? 'Низкое' : quality === 'medium' ? 'Среднее' : 'Высокое'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Тени */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Тени</label>
                <button
                  onClick={() => updateSettings({
                    graphics: {
                      ...settings.graphics,
                      shadows: !settings.graphics.shadows,
                    }
                  })}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${settings.graphics.shadows
                      ? 'bg-bright-cyan text-deep-blue'
                      : 'bg-gray-600 text-white'
                    }
                  `}
                >
                  {settings.graphics.shadows ? 'Вкл' : 'Выкл'}
                </button>
              </div>

              {/* Сглаживание */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Сглаживание</label>
                <button
                  onClick={() => updateSettings({
                    graphics: {
                      ...settings.graphics,
                      antialiasing: !settings.graphics.antialiasing,
                    }
                  })}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${settings.graphics.antialiasing
                      ? 'bg-bright-cyan text-deep-blue'
                      : 'bg-gray-600 text-white'
                    }
                  `}
                >
                  {settings.graphics.antialiasing ? 'Вкл' : 'Выкл'}
                </button>
              </div>
            </div>
          </div>

          {/* Геймплей */}
          <div className="p-6 bg-deep-blue/50 rounded-lg border border-bright-cyan/30">
            <h2 className="text-2xl font-heading mb-6 text-bright-cyan">🎮 Геймплей</h2>
            
            <div className="space-y-4">
              {/* Обучение */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Обучение</label>
                <button
                  onClick={() => updateSettings({
                    gameplay: {
                      ...settings.gameplay,
                      tutorialEnabled: !settings.gameplay.tutorialEnabled,
                    }
                  })}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${settings.gameplay.tutorialEnabled
                      ? 'bg-bright-cyan text-deep-blue'
                      : 'bg-gray-600 text-white'
                    }
                  `}
                >
                  {settings.gameplay.tutorialEnabled ? 'Вкл' : 'Выкл'}
                </button>
              </div>

              {/* Автосохранение */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Автосохранение</label>
                <button
                  onClick={() => updateSettings({
                    gameplay: {
                      ...settings.gameplay,
                      autoSave: !settings.gameplay.autoSave,
                    }
                  })}
                  className={`
                    px-6 py-2 rounded-lg font-bold transition-all
                    ${settings.gameplay.autoSave
                      ? 'bg-bright-cyan text-deep-blue'
                      : 'bg-gray-600 text-white'
                    }
                  `}
                >
                  {settings.gameplay.autoSave ? 'Вкл' : 'Выкл'}
                </button>
              </div>

              {/* Язык */}
              <div className="flex items-center justify-between">
                <label className="text-lg">Язык</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSettings({
                      gameplay: {
                        ...settings.gameplay,
                        language: 'ru',
                      }
                    })}
                    className={`
                      px-4 py-2 rounded-lg transition-all
                      ${settings.gameplay.language === 'ru'
                        ? 'bg-bright-cyan text-deep-blue font-bold'
                        : 'bg-deep-blue border border-bright-cyan/30 hover:border-bright-cyan'
                      }
                    `}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => updateSettings({
                      gameplay: {
                        ...settings.gameplay,
                        language: 'en',
                      }
                    })}
                    className={`
                      px-4 py-2 rounded-lg transition-all
                      ${settings.gameplay.language === 'en'
                        ? 'bg-bright-cyan text-deep-blue font-bold'
                        : 'bg-deep-blue border border-bright-cyan/30 hover:border-bright-cyan'
                      }
                    `}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка назад */}
        <div className="mt-8">
          <button
            onClick={handleBack}
            className="w-full px-6 py-4 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-bold rounded-lg hover:scale-105 transition-transform"
          >
            ← Назад в меню
          </button>
        </div>
      </div>
    </div>
  );
};
