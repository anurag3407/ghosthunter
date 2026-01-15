# 🤝 Contributing to GhostFounder

Thank you for your interest in contributing to GhostFounder! We welcome contributions from the community to help make this platform even better.

---

## 📑 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Contributions](#making-contributions)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing](#testing)
9. [Documentation](#documentation)
10. [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors. We expect everyone to:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome people of all backgrounds and experience levels
- **Be constructive**: Provide helpful feedback and accept criticism gracefully
- **Be collaborative**: Work together towards common goals

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Publishing others' private information
- Any conduct inappropriate in a professional setting

### Reporting

If you experience or witness unacceptable behavior, please report it to support@ghostfounder.com.

---

## 🚀 Getting Started

### Ways to Contribute

There are many ways to contribute to GhostFounder:

| Contribution Type | Description |
|-------------------|-------------|
| 🐛 **Bug Reports** | Report bugs and issues you find |
| ✨ **Feature Requests** | Suggest new features or improvements |
| 📖 **Documentation** | Improve docs, fix typos, add examples |
| 💻 **Code** | Fix bugs, implement features, refactor |
| 🎨 **Design** | UI/UX improvements, visual assets |
| 🧪 **Testing** | Write tests, improve coverage |
| 💬 **Support** | Help others in discussions |

### Before You Start

1. **Check existing issues**: Search open issues to avoid duplicates
2. **Read the docs**: Familiarize yourself with the project
3. **Ask questions**: Open a discussion if you're unsure
4. **Start small**: Begin with smaller contributions to get familiar

---

## 💻 Development Setup

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Tailwind CSS IntelliSense

### Local Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/ghostfounder.git
cd ghostfounder

# 3. Add upstream remote
git remote add upstream https://github.com/ghostfounder/ghostfounder.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 6. Validate setup
npm run validate-env

# 7. Start development server
npm run dev
```

### Required API Keys

For full functionality, you'll need:

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| **Clerk** | Authentication | [clerk.com](https://clerk.com) |
| **Firebase** | Database | [firebase.google.com](https://firebase.google.com) |
| **Google AI** | Gemini AI | [ai.google.dev](https://ai.google.dev) |
| **GitHub** | OAuth & API | [github.com/settings/developers](https://github.com/settings/developers) |

For testing, you can use Clerk test keys and a Firebase emulator.

### Verify Setup

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build the project
npm run build
```

---

## 📝 Making Contributions

### Workflow

```
1. Create Issue (optional) → Discuss the change
2. Fork Repository → Create your copy
3. Create Branch → Work in isolation
4. Make Changes → Implement your contribution
5. Test Locally → Verify everything works
6. Commit Changes → Follow commit guidelines
7. Push to Fork → Upload your changes
8. Open Pull Request → Submit for review
9. Address Feedback → Make requested changes
10. Merge! → Celebrate 🎉
```

### Creating a Branch

Use descriptive branch names:

```bash
# Feature branches
git checkout -b feature/add-dark-mode
git checkout -b feature/improve-ai-prompts

# Bug fix branches
git checkout -b fix/login-error
git checkout -b fix/memory-leak

# Documentation branches
git checkout -b docs/api-examples
git checkout -b docs/setup-guide

# Refactor branches
git checkout -b refactor/auth-module
```

### Making Changes

1. **Focus on one thing**: Each PR should address a single issue or feature
2. **Keep it small**: Smaller PRs are easier to review
3. **Update docs**: Add documentation for new features
4. **Add tests**: Include tests for new functionality
5. **Update types**: Keep TypeScript types accurate

---

## 📋 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, descriptive names
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const response = await db.collection('users').doc(userId).get();
  return response.data() as UserProfile;
}

// ❌ Bad: Any types, vague names
async function getData(id: any): Promise<any> {
  const res = await db.collection('users').doc(id).get();
  return res.data();
}
```

### React/Next.js Patterns

```tsx
// ✅ Good: Server Component (default)
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData();
  return <Dashboard data={data} />;
}

// ✅ Good: Client Component (when needed)
// src/components/Counter.tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `UserProfile.tsx` |
| **Pages** | lowercase | `page.tsx`, `layout.tsx` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Constants** | camelCase | `constants.ts` |
| **Types** | camelCase | `pitch-deck.ts` |
| **Styles** | camelCase | `globals.css` |

### Code Organization

```typescript
// Standard file structure
// 1. Imports (external first, then internal)
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';

// 2. Constants and types
const LOG_PREFIX = '[ComponentName]';

interface Props {
  user: User;
  onSave: (user: User) => void;
}

// 3. Component or function definition
export function ComponentName({ user, onSave }: Props) {
  // 4. Hooks
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  // 5. Handlers
  const handleSave = async () => {
    setLoading(true);
    await onSave(user);
    setLoading(false);
  };

  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### ESLint Rules

We use ESLint for code quality. Key rules:

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
];
```

### Tailwind CSS Guidelines

```tsx
// ✅ Good: Logical grouping, responsive first
<div className="
  flex flex-col gap-4 p-4
  md:flex-row md:gap-6 md:p-6
  bg-zinc-900 rounded-lg border border-zinc-800
  hover:border-zinc-700 transition-colors
">

// ❌ Bad: Mixed, disorganized
<div className="border-zinc-800 p-4 flex bg-zinc-900 hover:border-zinc-700 rounded-lg md:p-6 transition-colors gap-4 flex-col border md:flex-row md:gap-6">
```

---

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD changes |
| `chore` | Other maintenance |

### Commit Examples

```bash
# Feature
git commit -m "feat(pitch-deck): add export to PDF functionality"

# Bug fix
git commit -m "fix(auth): resolve session persistence issue on Safari"

# Documentation
git commit -m "docs(api): add examples for database query endpoint"

# Breaking change
git commit -m "feat(api)!: change response format for pitch-deck endpoints

BREAKING CHANGE: Response now wraps data in 'data' property"

# With scope
git commit -m "fix(code-police): handle webhook signature verification failure"

# Multiple line
git commit -m "feat(database): add MongoDB connection support

- Add MongoDB client library
- Create connection adapter
- Add schema detection for collections
- Update UI to show collection structure

Closes #123"
```

### Commit Best Practices

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Keep the first line under 72 characters
- Reference issues in the body or footer
- Explain "what" and "why", not "how"

---

## 🔄 Pull Request Process

### Before Opening a PR

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with `main`

### PR Title Format

Follow the same convention as commits:

```
feat(scope): description
fix(scope): description
docs(scope): description
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing approach

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests for my changes
- [ ] All tests pass locally
```

### Review Process

1. **Automated checks**: CI runs linting, type checking, and tests
2. **Maintainer review**: A maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Get approval from a maintainer
5. **Merge**: Maintainer merges the PR

### After Merge

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Delete your feature branch
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// Example test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { DeckList } from './DeckList';

describe('DeckList', () => {
  it('renders empty state when no decks', () => {
    render(<DeckList decks={[]} />);
    expect(screen.getByText('No decks found')).toBeInTheDocument();
  });

  it('renders deck cards when decks provided', () => {
    const decks = [
      { id: '1', projectName: 'Test Deck', slidesCount: 10 },
    ];
    render(<DeckList decks={decks} />);
    expect(screen.getByText('Test Deck')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<DeckList decks={mockDecks} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

### Test Coverage Goals

| Area | Target Coverage |
|------|-----------------|
| Utilities | 90%+ |
| Components | 80%+ |
| API Routes | 85%+ |
| Hooks | 85%+ |

---

## 📖 Documentation

### Documentation Types

1. **Code Comments**: Explain complex logic
2. **JSDoc**: Document functions and types
3. **README files**: Explain features and setup
4. **API docs**: Document endpoints

### JSDoc Example

```typescript
/**
 * Generates a pitch deck from README content using AI.
 * 
 * @param request - The generation request parameters
 * @param request.readme - The README content to analyze
 * @param request.deckStyle - The style of deck to generate
 * @returns A Promise resolving to the generated deck
 * 
 * @example
 * ```typescript
 * const deck = await generateDeck({
 *   readme: '# My Project\n...',
 *   deckStyle: 'seed',
 * });
 * ```
 * 
 * @throws {ValidationError} If readme is empty
 * @throws {AIError} If AI generation fails
 */
export async function generateDeck(
  request: GenerateDeckRequest
): Promise<GenerateDeckResponse> {
  // Implementation
}
```

### Documentation Checklist

When adding new features:

- [ ] Add JSDoc comments to new functions
- [ ] Update relevant README files
- [ ] Add API documentation if new endpoints
- [ ] Include code examples
- [ ] Update architecture docs if significant changes

---

## 💬 Community

### Getting Help

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Email**: support@ghostfounder.com

### Stay Updated

- Watch the repository for updates
- Star the project to show support
- Follow releases for changelogs

### Recognition

We appreciate all contributions! Contributors will be:

- Listed in our [Contributors](https://github.com/ghostfounder/ghostfounder/graphs/contributors) page
- Mentioned in release notes for significant contributions
- Recognized in our community highlights

---

## 🙏 Thank You

Your contributions make GhostFounder better for everyone. Whether you're fixing a typo or implementing a major feature, we appreciate your time and effort!

**Happy coding! 🚀**

---

<div align="center">

**Together, we build the future of startup tooling**

[Back to Main README](./README.md)

</div>
