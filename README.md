<div align="center">

# 🍳 Cookbook Next

**A modern recipe sharing platform built with Next.js, Apollo Server, and Neon (Serverless Postgres)**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.11-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[🚀 Live Demo](https://cookbook-next.vercel.app) • [📊 Coverage Report](https://marosdaniel.github.io/cookbook-next/) • [📝 Changelog](./CHANGELOG.md)

### SonarQube Quality

| Metric | Badge |
| --- | --- |
| Quality Gate | [![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Bugs | [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=bugs)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Code Smells | [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Coverage | [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=coverage)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Duplicated Lines | [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Lines of Code | [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Reliability | [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Security | [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Technical Debt | [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Maintainability | [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |
| Vulnerabilities | [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=marosdaniel_cookbook-next&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=marosdaniel_cookbook-next) |

</div>

---

## ✨ Features

- 🔐 **Secure authentication** - NextAuth v5 credential flow with JWT sessions, Argon2id hashing, and legacy bcrypt fallback
- 🌍 **Internationalization** - English, Hungarian, and German locales via next-intl
- 🎨 **Modern UI** - Mantine-based interface with dark/light theme support and motion-enhanced page transitions
- 📱 **Responsive design** - Mobile-first layouts for browsing, auth, and recipe creation flows
- 🔍 **GraphQL API** - Apollo Server 5 with a modular schema, DataLoader batching, and graphql-armor hardening
- 🗄️ **Database** - Neon serverless Postgres with Prisma 7, connection pooling, and migrations
- 🧑‍🍳 **Recipe management** - Multi-step recipe composer with local draft saving, slug-based SEO routes, favorites, ratings, and follow relationships
- ⚡ **Caching & rate limiting** - Upstash Redis caching with fallback behavior and sliding-window rate limiting on sensitive operations
- 🛡️ **Security hardening** - Zod validation, HTML sanitization, and strict security headers
- 🔎 **SEO** - Dynamic recipe metadata with Open Graph, Twitter cards, canonical URLs, and localized fallbacks
- ✅ **Type safety** - Full TypeScript coverage across app, API, and validation layers
- 🧪 **Testing** - Unit/integration tests with Vitest and end-to-end coverage with Playwright
- 📊 **State management** - Redux Toolkit for metadata and global app state
- 🎯 **Developer experience** - Biome, Turbopack, pnpm, and GitHub Actions automation

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.11 (App Router, Turbopack)
- **Language:** TypeScript 6.0.3
- **UI Library:** Mantine 9.4.2 (core, form, hooks, notifications, modals, spotlight, carousel)
- **Animation:** Motion 12.42.2 for page and card transitions
- **State Management:** Redux Toolkit 2.12.0
- **Forms:** Mantine Form + `mantine-form-zod-resolver` (Zod validation)
- **Data fetching:** Apollo Client 4.2.7 (custom error-handling link with localized notifications)
- **Icons:** Tabler Icons / React Icons
- **i18n:** next-intl 4.13.3 (English, Hungarian, German)

### Backend
- **API:** Apollo Server 5.5.1 + GraphQL (`@as-integrations/next`), modular schema (user/recipe/metadata), `graphql-armor` hardening, DataLoader batching
- **Database:** Serverless Postgres via Neon (`@neondatabase/serverless` + `@prisma/adapter-neon`, connection pooling)
- **ORM:** Prisma 7.9.0
- **Authentication:** NextAuth 5.0.0-beta.32 with JWT session strategy
- **Password hashing:** Argon2id (primary) with legacy bcryptjs fallback
- **Caching:** Upstash Redis 1.38.0 (TTL-based query caching with fallback behavior)
- **Rate limiting:** Upstash Ratelimit 2.0.8 (sliding window) on auth & mutation-heavy operations
- **Validation & sanitization:** Zod 4.4.3 + isomorphic-dompurify

### DevOps & Tools
- **Build Tool:** Turbopack
- **Testing:** Vitest 4.1.10 + Testing Library + Happy DOM (unit/integration), Playwright 1.61.1 (E2E)
- **Code Quality:** Biome 2.5.5
- **Package Manager:** pnpm 11.15.1
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions + Semantic Release

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 24.x
- **pnpm** 11.15.1
- **Postgres / Neon** (Postgres-compatible, e.g. Neon serverless)

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
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### Environment Variables

Create a `.env.local` file with the following (example for Neon/Postgres):

```env
# Database (Postgres / Neon)
DATABASE_URL=postgresql://username:password@db-host:5432/cookbook

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
│   │   └── prisma.ts          # Prisma client (Neon/Postgres)
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

### End-to-end (E2E) tests

This repository uses Playwright for end-to-end tests. E2E tests are placed under the `e2e/` folder and are split into reusable "test-cases" and higher-level "suites". See the dedicated documentation for details and examples: [E2E Test Documentation](docs/E2E.md).

Quick commands:

```bash
# Install Playwright browsers (first time or CI)
pnpm exec playwright install --with-deps chromium

# Run E2E headless
pnpm test:e2e

# Run Playwright UI runner
pnpm test:e2e:ui

# Run E2E in CI-clean mode (forces fresh webserver)
CI=1 pnpm test:e2e
```

Where reports and artifacts are written:

- `playwright-report/` — HTML report (local)
- `test-results/` — raw results and traces/videos (CI artifact)
- On CI the reports are uploaded and published to GitHub Pages under the project (see `.github/workflows/deploy.yml`).

---

## 📊 GraphQL API

The application uses Apollo Server with a type-safe GraphQL API.

### Endpoint
```
POST /api/graphql
```

### Key Operations

**User queries/mutations:**
- `me`, `user(id)`, `users` - Get current/single/all users
- `registerUser`, `updateUser`, `deleteUser` - Account lifecycle

**Recipe queries/mutations:**
- `recipes` (filterable by title, category, difficulty, labels, max cooking time), `recipe(idOrSlug)`
- `createRecipe`, `editRecipe`, `deleteRecipe`
- `rateRecipe`, `deleteRating`, `addToFavoriteRecipes`, `removeFromFavoriteRecipes`

**Metadata queries:**
- Static reference data (categories, labels, units, difficulty levels, cuisines, dietary flags, allergens, equipment)

### Authentication & Protection

GraphQL operations are protected based on user roles (public / authenticated user / blogger / admin) via an operation-permission plugin, and additionally hardened with:
- **graphql-armor** (depth/complexity/amount limiting)
- **Persisted query validation** (SHA-256 hash)
- **Rate limiting** (sliding window via Upstash) on sensitive mutations (create/edit/delete recipe, rate recipe, reset password)
- **Query result limits** (max 100 items per request)

---

## 🔐 Authentication Flow

1. **Registration:** User signs up with email/password (Zod-validated, sanitized input)
2. **Login:** Credentials verified with Argon2id (legacy accounts fall back to bcrypt)
3. **JWT Token:** Generated via NextAuth v5, enriched with user data (id, role, username, locale)
4. **Session:** Stored in secure HTTP-only cookie
5. **Remember Me:** Extended session (14 days vs 2 hours)
6. **Password Reset:** Token-based email recovery
7. **Route protection:** Middleware (`src/proxy.ts`) guards authenticated areas (`/me/*`), redirecting to `/login` with a callback URL

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

The Prisma schema is located at `prisma/schema.prisma`, running on Neon (serverless Postgres) with connection pooling (`@prisma/adapter-neon`, max 10 connections, 1 use per connection).

**Models:**
- **User** - profile, unique email/username, locale, `role` (`ADMIN` / `USER` / `BLOGGER`), reset-password token/expiry
- **Recipe** - title/description, unique+indexed `slug`, author (FK), JSON metadata fields (category, labels, difficulty, cuisine, cost level, dietary flags, allergens, equipment), SEO fields (`seoTitle`, `seoDescription`, `socialImage`), time-tracking fields (prep/cook/rest/total minutes), `favoritedBy` (M2M with User)
- **Ingredient** / **PreparationStep** - recipe sub-entities with cascading delete on recipe removal
- **Rating** - one rating per user per recipe (composite unique index), aggregated via DataLoader
- **Follow** - explicit join table modeling a user-follows-user graph

```prisma
model User {
   id                   String   @id @default(uuid())
   firstName            String
   lastName             String
   userName             String   @unique
   email                String   @unique
   password             String
   locale               String   @default("en-gb")
   role                 UserRole @default(USER)
   resetPasswordToken   String?
   resetPasswordExpires DateTime?
   createdAt            DateTime @default(now())
   updatedAt            DateTime @updatedAt
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
- `DATABASE_URL`
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

