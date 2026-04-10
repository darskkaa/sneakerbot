# Contributing to SneakerBot

Thank you for your interest in contributing to SneakerBot! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sneakerbot.git`
3. Add upstream remote: `git remote add upstream https://github.com/darskkaa/sneakerbot.git`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install
cd client && npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Making Changes

1. Create a feature branch from `master`
2. Make your changes with clear, descriptive commits
3. Add tests for new functionality
4. Update documentation as needed
5. Ensure code passes linting: `npm run lint`

## Submitting a Pull Request

1. Push to your fork
2. Create a Pull Request against the main repository
3. Provide a clear description of changes
4. Link any related issues
5. Wait for code review and CI checks to pass

## Code Review Process

- At least one maintainer review is required
- All CI checks must pass
- Code should follow project style guidelines
- Security issues must be addressed

## Reporting Issues

- Use GitHub Issues for bug reports
- Provide clear reproduction steps
- Include environment details (OS, Node version, etc.)
- For security issues, see SECURITY.md

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
