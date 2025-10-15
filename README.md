# 🚀 Space Engineer (Космический Инженер)

<div align="center">

**Educational game for learning programming through visual node-based programming**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0_MVP-blue.svg)](https://github.com/bilbo1363/space-engineer)
[![Status](https://img.shields.io/badge/status-MVP_Complete-success.svg)](https://github.com/bilbo1363/space-engineer)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[English](#english) | [Русский](#russian)

</div>

---

## 🌟 About

**Space Engineer** is an educational game designed for children aged 8-14 to learn programming fundamentals through gameplay. Players create programs using a modern node-based editor and watch their robots execute missions in a beautiful 3D environment.

### ✨ Key Features

- 🎯 **Node-based Programming** - Modern visual programming (like Unreal Blueprints)
- 🤖 **3D Visualization** - Full 3D scene with animations (Three.js)
- 🔧 **Custom Functions** - Create reusable functions
- 📊 **Dual View** - 2D simulator + 3D visualization
- 🎓 **Progressive Learning** - From simple to complex
- 💾 **Schema Management** - Save, search, organize programs

---

## 📸 Screenshots

> Coming soon! The game features:
> - Beautiful 3D space environments
> - Intuitive node-based programming interface
> - Animated robot executing your programs
> - Mission briefings and results screens

---

<a name="russian"></a>

## 🇷🇺 Русская версия

Образовательная игра для обучения школьников 5-9 классов основам программирования через визуальное программирование роботов.

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

### Сборка для продакшена

```bash
npm run build
```

### Предпросмотр продакшен-сборки

```bash
npm run preview
```

## 📁 Структура проекта

```
space-engineer/
├── src/
│   ├── components/          # React компоненты
│   │   ├── ui/             # Базовые UI компоненты
│   │   ├── editor/         # Редактор программ
│   │   ├── scene/          # 3D сцена
│   │   └── mission/        # Компоненты миссий
│   ├── core/               # Бизнес-логика
│   │   ├── interpreter/    # Интерпретатор программ
│   │   ├── robots/         # Логика роботов
│   │   ├── missions/       # Система миссий
│   │   └── nodes/          # Определения нодов
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript типы
│   ├── utils/              # Утилиты
│   └── assets/             # Статические ресурсы
├── tests/                  # Тесты
└── docs/                   # Документация
```

## 🎮 MVP Scope (v1.0)

### Включено:
- ✅ Этап 1: 5 миссий ("Первый шаг", "Лабиринт", "Доставка груза", "Время ожидания", "Первый отчёт")
- ✅ Робот "Пионер"
- ✅ 8 базовых нодов (движение, действия, служебные)
- ✅ Основной игровой цикл
- ✅ Сохранение в localStorage
- ✅ Система подсказок
- ✅ Система звёзд (оценка выполнения)

### Исключено из MVP:
- ❌ Этапы 1.5, 2, 3, 4, 5
- ❌ Остальные роботы (Трудяга, Скаут, Инженер, Дрон)
- ❌ Продвинутые ноды (циклы, условия, функции)
- ❌ Регистрация и серверная часть
- ❌ Социальные функции
- ❌ Система достижений

## 🛠 Технологический стек

- **Frontend**: React 18, TypeScript 5
- **3D**: Three.js, React Three Fiber
- **State**: Zustand
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Редактор**: React Flow
- **Build**: Vite
- **Tests**: Vitest, Playwright

## 📝 Следующие шаги разработки

1. ✅ Инициализация проекта
2. ✅ Настройка инструментов качества кода
3. ✅ Создание базовой структуры
4. ⏳ Spike #1: 3D-сцена и анимация робота
5. ⏳ Spike #2: Визуальный редактор программ
6. ⏳ Spike #3: Интерпретатор и управление состоянием
7. ⏳ Разработка основного функционала

## 📚 Документация

Полная документация проекта находится в папке `/docs`:

- **[Обзор документации](./docs/README.md)** - Начните отсюда!
- **[Руководство пользователя](./docs/06_User_Guide.md)** - Как играть
- **[Руководство разработчика](./docs/07_Developer_Guide.md)** - Как контрибьютить
- **[Game Design Document](./docs/02_Game_Design_Document.md)** - Дизайн игры
- **[Техническая документация](./docs/03_Technical_Design_Document.md)** - Архитектура
- **[API Reference](./docs/08_API_Reference.md)** - Справочник API
- **[Changelog](./docs/10_Changelog.md)** - История изменений

## 🤝 Разработка

### Запуск линтера

```bash
npm run lint
```

### Форматирование кода

```bash
npm run format
```

### Запуск тестов

```bash
npm run test
```

## 📄 Лицензия

Образовательный проект для обучения программированию.
