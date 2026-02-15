<div align="center">

# 🍳 Cookbook Next

**A modern recipe sharing platform built with Next.js, Apollo Server, and MongoDB**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://cookbook-next.vercel.app) • [📊 Coverage Report](https://marosdaniel.github.io/cookbook-next/) • [📝 Changelog](./CHANGELOG.md)

</div>

---

## ✨ Features

- 🔐 **Secure Authentication** - NextAuth v5 with JWT & credentials provider
- 🌍 **Internationalization** - Multi-language support (English, Hungarian, German)
- 🎨 **Modern UI** - Mantine UI components with dark/light theme
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **GraphQL API** - Apollo Server with type-safe operations
- 🗄️ **Database** - MongoDB with Prisma ORM
- ✅ **Type Safety** - Full TypeScript coverage
- 🧪 **Testing** - Comprehensive unit & integration tests with Vitest
- 🚀 **Performance** - Next.js App Router with Turbopack
- 📊 **State Management** - Redux Toolkit
- 🎯 **Code Quality** - Biome for linting & formatting
- 🔄 **CI/CD** - Automated releases with Semantic Release

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.9
- **UI Library:** Mantine 8.3
- **State Management:** Redux Toolkit
- **Forms:** Formik + Zod validation
- **Icons:** React Icons
- **i18n:** next-intl

### Backend
- **API:** Apollo Server + GraphQL
- **Database:** MongoDB 7.0
- **ORM:** Prisma 6.19
- **Authentication:** NextAuth v5 (beta)
- **Password:** bcrypt
- **JWT:** jsonwebtoken

### DevOps & Tools
- **Build Tool:** Turbopack
- **Testing:** Vitest + Testing Library + Happy DOM
- **Code Quality:** Biome
- **Package Manager:** pnpm
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions + Semantic Release

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.x
- **pnpm** 10.x
- **MongoDB** 7.x

### Installation

```bash
# Clone the repository
git clone https://github.com/marosdaniel/cookbook-next.git
cd cookbook-next

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up your environment variables in .env.local
# - MONGODB_URI
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cookbook

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Node Environment
NODE_ENV=development
```

### Development

```bash
# Run development server (with Turbopack)
pnpm dev

# Run type checking
pnpm typecheck

# Run tests
pnpm test:unit
pnpm test:coverage
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
# Generate Prisma client and build
pnpm build

# Start production server
pnpm start
```

---

## 📁 Project Structure

```
cookbook-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, signup, reset)
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   └── graphql/       # GraphQL endpoint
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── AuthButton/
│   │   ├── LanguageSelector/
│   │   ├── Logo/
│   │   ├── Navbar/
│   │   ├── Shell/
│   │   └── ThemeSwitcher/
│   ├── lib/                   # Utility libraries
│   │   ├── apollo/            # Apollo Client setup
│   │   ├── graphql/           # GraphQL schema & resolvers
│   │   ├── locale/            # i18n utilities
│   │   ├── store/             # Redux store
│   │   ├── mongodb.ts         # MongoDB client
│   │   └── prisma.ts          # Prisma client
│   ├── providers/             # React context providers
│   ├── types/                 # TypeScript type definitions
│   ├── locales/               # Translation files
│   └── auth.ts                # NextAuth v5 configuration
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .github/                   # GitHub Actions workflows
└── coverage/                  # Test coverage reports
```

---

## 🧪 Testing

This project maintains high code quality with comprehensive test coverage.

```bash
# Run all unit tests
pnpm test:unit

# Run tests with coverage report
pnpm test:coverage

# View coverage report
open coverage/index.html
```

**Latest Coverage:** [View Full Report](https://marosdaniel.github.io/cookbook-next/)

---

## 📊 GraphQL API

The application uses Apollo Server with a type-safe GraphQL API.

### Endpoint
```
POST /api/graphql
```

### Key Operations

**Queries:**
- `me` - Get current user
- `user(id)` - Get user by ID
- `users` - List all users

**Mutations:**
- `registerUser` - Create new account
- `updateUser` - Update user profile
- `deleteUser` - Delete account

### Authentication

GraphQL operations are protected based on user roles:
- **Public:** Registration
- **Authenticated:** Profile updates, queries
- **Admin:** User management

---

## 🔐 Authentication Flow

1. **Registration:** User signs up with email/password
2. **Login:** Credentials verified with bcrypt
3. **JWT Token:** Generated with user data
4. **Session:** Stored in secure HTTP-only cookie
5. **Remember Me:** Extended session (14 days vs 2 hours)
6. **Password Reset:** Token-based email recovery

---

## 🌍 Internationalization

Supported languages:
- 🇬🇧 English (en-gb)
- 🇭🇺 Hungarian (hu)
- 🇩🇪 German (de)

Language files are located in `src/locales/`.

---

## 🎨 Theming

The app supports **dark** and **light** themes using Mantine's theming system.

Theme configurations:
- `src/providers/mantine/lightTheme.ts`
- `src/providers/mantine/darkTheme.ts`

---

## 📦 Database Schema

### User Model
```prisma
model User {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  firstName             String
  lastName              String
  userName              String    @unique
  email                 String    @unique
  password              String
  locale                String    @default("en")
  role                  UserRole  @default(USER)
  resetPasswordToken    String?
  resetPasswordExpires  DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  USER
  BLOGGER
}
```

---

## 🔧 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test:unit` | Run unit tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Lint code with Biome |
| `pnpm format` | Format code with Biome |

---

## 🚢 Deployment

This project is configured for deployment on **Vercel**.

### Automatic Deployments
- **Production:** Pushes to `main` branch
- **Preview:** Pull requests

### Manual Deployment
```bash
vercel --prod
```

### Environment Variables
Set these in your Vercel project settings:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

**Automatic Deployments:**
- Tests and quality checks run on every push
- Production deployment on `main` branch
- Coverage reports published to GitHub Pages

#### 🚦 CI Workflow Triggers

The CI pipeline intelligently decides when to run based on your changes:

**✅ CI Will Run For:**
- Code changes in `src/`
- Configuration changes (`package.json`, `tsconfig.json`, etc.)
- GitHub Actions workflow changes
- Prisma schema changes
- Any TypeScript, JavaScript, or CSS files

**⏭️ CI Will Skip For:**
- Documentation updates (`*.md` files)
- VS Code settings changes (`.vscode/**`)
- License file updates
- `.gitignore` changes
- `.env.example` updates

#### 🏷️ Commit Message Conventions

Use these keywords in your commit messages to control CI behavior:

**Skip CI completely:**
```bash
git commit -m "docs: update README [skip ci]"
git commit -m "docs: fix typo [ci skip]"
```

**Recommended commit message format:**
```bash
<type>(<scope>): <subject> [<ci-directive>]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**
```bash
# Documentation change - CI skipped automatically
git commit -m "docs: add API documentation"

# Documentation change - CI skipped manually
git commit -m "docs: update contributing guide [skip ci]"

# Feature with scope
git commit -m "feat(auth): add password reset functionality"
git commit -m "feat(recipe): implement recipe sharing feature"

# Bug fix with scope
git commit -m "fix(login): resolve authentication token expiration"
git commit -m "fix(navbar): correct mobile menu alignment"

# Refactor with scope and skip CI
git commit -m "refactor(components): update button styles [skip ci]"

# Feature with mixed changes - skip CI manually if needed
git commit -m "feat: add user profile page [skip ci]"

# Bug fix - CI runs normally
git commit -m "fix: resolve login authentication issue"

# Multiple files with explicit skip
git commit -m "chore: update readme and license [ci skip]"
```

#### 🔄 CI Jobs Overview

When CI runs, it executes these jobs in order:

1. **Quality Checks** (parallel)
   - Biome linting
   - TypeScript type checking
   - Unit tests
   - Integration tests

2. **Test Coverage** (after quality checks)
   - Generate coverage report
   - Upload to GitHub Pages

3. **Deploy Production** (main branch only)
   - Build and deploy to Vercel

4. **Semantic Release** (after deployment)
   - Generate changelog
   - Create GitHub release
   - Update version

#### 💡 Best Practices

**When to skip CI:**
- ✅ Pure documentation changes
- ✅ README/CHANGELOG updates
- ✅ Comment updates
- ✅ Typo fixes in docs
- ✅ .gitignore or .env.example updates

**When NOT to skip CI:**
- ❌ Any code changes
- ❌ Dependency updates
- ❌ Configuration changes
- ❌ Test modifications
- ❌ When you're unsure

**Pro tips:**
- Use automatic skip (path-based) when possible
- Use manual `[skip ci]` only for mixed changes
- Keep documentation commits separate from code commits
- CI skip works on both commits and pull requests

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use **Biome** for linting and formatting
- Follow **TypeScript** best practices
- Write **tests** for new features
- Keep commits **atomic** and **semantic**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Daniel Maros**

- GitHub: [@marosdaniel](https://github.com/marosdaniel)
- Repository: [cookbook-next](https://github.com/marosdaniel/cookbook-next)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Mantine](https://mantine.dev/) - React Components Library
- [Apollo GraphQL](https://www.apollographql.com/) - GraphQL Implementation
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Vercel](https://vercel.com/) - Deployment Platform

---

<div align="center">

Made with ❤️ by Daniel Maros

⭐ Star this repo if you find it useful!

</div>

