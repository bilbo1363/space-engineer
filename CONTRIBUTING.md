# Contributing to Space Engineer

First off, thank you for considering contributing to Space Engineer! 🎉

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment** (OS, browser, Node version)

### Suggesting Features

Feature suggestions are welcome! Please:

- **Check existing suggestions** first
- **Describe the feature** in detail
- **Explain why it would be useful**
- **Provide examples** if possible

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Follow code style** (run `npm run lint` and `npm run format`)
5. **Add tests** if applicable
6. **Update documentation** if needed
7. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
8. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Open a Pull Request**

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add new mission 1.6
fix: correct door animation timing
docs: update API reference
```

## 🎨 Code Style

- **TypeScript** - Always use types, avoid `any`
- **React** - Functional components with hooks
- **Naming**:
  - PascalCase for components and types
  - camelCase for variables and functions
  - UPPER_CASE for constants
- **Formatting** - Run `npm run format` before committing
- **Linting** - Run `npm run lint` and fix all errors

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass: `npm run test`
- Aim for 80%+ code coverage

## 📚 Documentation

- Update relevant documentation in `/docs`
- Add JSDoc comments for public APIs
- Update README if needed

## 🔍 Code Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Code follows style guide

## 🎯 Development Setup

See [Developer Guide](./docs/07_Developer_Guide.md) for detailed setup instructions.

**Quick start:**
```bash
git clone https://github.com/bilbo1363/space-engineer.git
cd space-engineer
npm install
npm run dev
```

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn
- Give constructive feedback
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

## 📞 Questions?

- Open a [Discussion](https://github.com/bilbo1363/space-engineer/discussions)
- Check [Documentation](./docs/README.md)
- Ask in Issues (label: question)

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the game (if significant contribution)

---

**Thank you for making Space Engineer better!** 🚀
