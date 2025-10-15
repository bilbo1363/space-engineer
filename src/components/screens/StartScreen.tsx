import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const StartScreen = () => {
  const { setCurrentScreen } = useAppStore();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Показываем подсказку через 2 секунды
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setCurrentScreen('mainMenu');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-black text-white flex flex-col items-center justify-center cursor-pointer"
      onClick={handleStart}
    >
      {/* Логотип игры */}
      <div className="text-center mb-12 animate-pulse">
        <div className="text-8xl mb-6">🤖</div>
        <h1 className="text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-bright-cyan to-bright-orange bg-clip-text text-transparent">
          SPACE ENGINEER
        </h1>
        <p className="text-2xl text-gray-400 font-light">
          Программируй. Исследуй. Побеждай.
        </p>
      </div>

      {/* Версия */}
      <div className="absolute bottom-8 left-8 text-sm text-gray-500">
        v0.1.0 Alpha
      </div>

      {/* Подсказка */}
      {showPrompt && (
        <div className="absolute bottom-8 text-center animate-bounce">
          <p className="text-xl text-bright-cyan">
            Нажмите в любом месте для начала
          </p>
        </div>
      )}

      {/* Копирайт */}
      <div className="absolute bottom-8 right-8 text-sm text-gray-500">
        © 2025 Space Engineer Team
      </div>
    </div>
  );
};
