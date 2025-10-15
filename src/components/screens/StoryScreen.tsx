import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StoryMoment } from '../../types/game';

// Сюжетные моменты игры
const STORY_MOMENTS: Record<string, StoryMoment> = {
  intro: {
    id: 'intro',
    title: 'Добро пожаловать на борт',
    character: 'aria',
    content: `Приветствую вас на борту космической станции "Пионер"!

Я - ARIA, ваш искусственный помощник и инструктор. Рада знакомству!

Вы были выбраны для участия в программе подготовки космических инженеров. Ваша задача - научиться программировать роботов для исследования далёких планет.

Готовы начать обучение?`,
    choices: [
      { text: 'Да, я готов!', nextMoment: 'training_start' },
      { text: 'Расскажи подробнее', nextMoment: 'about_program' },
    ],
  },

  about_program: {
    id: 'about_program',
    title: 'О программе',
    character: 'aria',
    content: `Программа "Космический Инженер" - это уникальная возможность стать частью команды исследователей космоса.

Вы будете:
• Программировать роботов для выполнения различных задач
• Исследовать неизвестные планеты и собирать ресурсы
• Решать сложные логические задачи
• Открывать новые технологии

Каждая миссия приближает нас к великой цели - колонизации новых миров!

Готовы начать?`,
    choices: [
      { text: 'Да, начнём!', nextMoment: 'training_start' },
    ],
  },

  training_start: {
    id: 'training_start',
    title: 'Начало обучения',
    character: 'aria',
    content: `Отлично! Начнём с основ.

Перед вами - робот модели "Пионер". Это простой, но надёжный робот для базовых задач.

Ваша первая миссия будет простой - научить робота двигаться по прямой линии. Это основа всех будущих программ.

Я буду рядом и помогу, если возникнут трудности. Не бойтесь экспериментировать!

Удачи, Инженер!`,
    nextMoment: 'mission',
    unlocksMission: 'mission_1_1',
  },

  mission: {
    id: 'mission',
    title: 'Переход к миссии',
    character: 'aria',
    content: 'Переходим к выбору миссии...',
    nextMoment: 'missionSelect',
  },
};

export const StoryScreen = () => {
  const { currentStoryMoment, setCurrentStoryMoment, addCompletedStoryMoment, setCurrentScreen } = useAppStore();
  const [currentMoment, setCurrentMoment] = useState<StoryMoment>(
    STORY_MOMENTS[currentStoryMoment || 'intro']
  );
  const [isTyping, setIsTyping] = useState(true);

  // Симуляция печати текста
  useState(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    return () => clearTimeout(timer);
  });

  const handleChoice = (nextMomentId: string) => {
    addCompletedStoryMoment(currentMoment.id);

    if (nextMomentId === 'missionSelect') {
      setCurrentScreen('missionSelect');
      return;
    }

    const nextMoment = STORY_MOMENTS[nextMomentId];
    if (nextMoment) {
      setCurrentMoment(nextMoment);
      setCurrentStoryMoment(nextMomentId);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const handleContinue = () => {
    if (currentMoment.nextMoment) {
      handleChoice(currentMoment.nextMoment);
    }
  };

  const handleSkip = () => {
    addCompletedStoryMoment(currentMoment.id);
    setCurrentScreen('missionSelect');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-blue via-dark-purple to-black text-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Персонаж */}
        <div className="text-center mb-8">
          <div className="text-9xl mb-4 animate-pulse">
            {currentMoment.character === 'aria' ? '🤖' : '👨‍🚀'}
          </div>
          <h2 className="text-3xl font-heading text-bright-cyan">
            {currentMoment.character === 'aria' ? 'ARIA' : 'Вы'}
          </h2>
        </div>

        {/* Диалоговое окно */}
        <div className="p-8 bg-deep-blue/80 rounded-lg border-2 border-bright-cyan/50 backdrop-blur-sm">
          <h1 className="text-2xl font-heading mb-6 text-bright-orange">
            {currentMoment.title}
          </h1>
          
          <div className="text-lg leading-relaxed whitespace-pre-line mb-8">
            {isTyping ? (
              <span className="animate-pulse">{currentMoment.content.substring(0, 50)}...</span>
            ) : (
              currentMoment.content
            )}
          </div>

          {/* Выборы или кнопка продолжения */}
          {!isTyping && (
            <div className="space-y-3">
              {currentMoment.choices ? (
                currentMoment.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice.nextMoment)}
                    className="w-full p-4 bg-bright-cyan/20 border-2 border-bright-cyan/50 rounded-lg hover:bg-bright-cyan/30 hover:border-bright-cyan transition-all text-left"
                  >
                    → {choice.text}
                  </button>
                ))
              ) : (
                <button
                  onClick={handleContinue}
                  className="w-full p-4 bg-gradient-to-r from-bright-cyan to-bright-orange text-deep-blue font-bold rounded-lg hover:scale-105 transition-transform"
                >
                  Продолжить →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Кнопка пропуска */}
        <div className="text-center mt-6">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Пропустить сюжет →
          </button>
        </div>
      </div>
    </div>
  );
};
