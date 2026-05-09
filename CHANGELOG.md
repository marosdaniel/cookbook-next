# [2.29.0](https://github.com/marosdaniel/cookbook-next/compare/v2.28.0...v2.29.0) (2026-05-09)


### Features

* implement Upstash rate limiting for the GraphQL API route ([ab28c64](https://github.com/marosdaniel/cookbook-next/commit/ab28c640aa733760c56392d6fb76a33a05707d63))

# [2.28.0](https://github.com/marosdaniel/cookbook-next/compare/v2.27.0...v2.28.0) (2026-04-20)


### Features

* implement Redis cache invalidation for user and recipe service operations ([4f9cf4f](https://github.com/marosdaniel/cookbook-next/commit/4f9cf4f42452c6c2c2647840d771bca7f54fa92a))
* implement Redis caching for Recipe and User service queries and update dependencies ([8a77640](https://github.com/marosdaniel/cookbook-next/commit/8a77640e344eb216668668fe7cb3b25be3c70f05))

# [2.27.0](https://github.com/marosdaniel/cookbook-next/compare/v2.26.0...v2.27.0) (2026-04-18)


### Features

* integrate Vercel Speed Insights into root layout and update dependencies ([d9f1b8c](https://github.com/marosdaniel/cookbook-next/commit/d9f1b8c8866020966f3e4b0c9cc030d071c29189))

# [2.26.0](https://github.com/marosdaniel/cookbook-next/compare/v2.25.0...v2.26.0) (2026-04-05)


### Features

* enhance SEO metadata with keywords, robots directives, OpenGraph types, and Twitter cards ([6230271](https://github.com/marosdaniel/cookbook-next/commit/6230271834d4384dfb9bc39d3d7b465d1d2b60df))

# [2.25.0](https://github.com/marosdaniel/cookbook-next/compare/v2.24.0...v2.25.0) (2026-03-29)


### Features

* add Follow model to schema and update Prisma configuration with directUrl ([2208bff](https://github.com/marosdaniel/cookbook-next/commit/2208bffda618cc9ebfa333664a7ea58a89643f37))
* enhance favorite recipes page with statistics, loading skeletons, and improved UI layout ([274d184](https://github.com/marosdaniel/cookbook-next/commit/274d184778b58e6aef9e190d481954cf00680636))

# [2.24.0](https://github.com/marosdaniel/cookbook-next/compare/v2.23.0...v2.24.0) (2026-03-29)


### Features

* implement user following system with GraphQL resolvers, Prisma schema, and UI components ([92136ae](https://github.com/marosdaniel/cookbook-next/commit/92136ae47173f21e39d1efaf43bfbcf19ca2e9e3))

# [2.23.0](https://github.com/marosdaniel/cookbook-next/compare/v2.22.0...v2.23.0) (2026-03-29)


### Features

* implement user recipes dashboard with GraphQL query and UI components ([c054ed2](https://github.com/marosdaniel/cookbook-next/commit/c054ed2e6066d9dd38ff9b3d6d311083e1f34213))

# [2.22.0](https://github.com/marosdaniel/cookbook-next/compare/v2.21.0...v2.22.0) (2026-03-29)


### Features

* add empty state translation to German and Hungarian locales ([bf2f7b6](https://github.com/marosdaniel/cookbook-next/commit/bf2f7b62201d2e7d26802b2e6c08fabf58c924a5))

# [2.21.0](https://github.com/marosdaniel/cookbook-next/compare/v2.20.0...v2.21.0) (2026-03-25)


### Bug Fixes

* Correct JSON formatting and add missing commas in locale files. ([4836542](https://github.com/marosdaniel/cookbook-next/commit/4836542c09e46a6409d7166d90a455c71f4acad1))
* Update `useTranslations` mock in Footer tests to support namespaces. ([bfb7054](https://github.com/marosdaniel/cookbook-next/commit/bfb7054a424570a631b856edb77126a0ecb5a36c))


### Features

* Implement internationalization across various components and pages, including auth forms, recipe creation, and the homepage. ([9abcdae](https://github.com/marosdaniel/cookbook-next/commit/9abcdae800d6929c5a4119b3dc7c665efaff9fbf))

# [2.20.0](https://github.com/marosdaniel/cookbook-next/compare/v2.19.0...v2.20.0) (2026-03-24)


### Features

* Enhance NavbarLinksGroup styling, active state indicators, and expansion logic, while updating Text component structure in recipe basics. ([e2ccd2e](https://github.com/marosdaniel/cookbook-next/commit/e2ccd2eb24cb9e98496fa294301d412c1995de4d))

# [2.19.0](https://github.com/marosdaniel/cookbook-next/compare/v2.18.0...v2.19.0) (2026-03-24)


### Features

* Add 'no favorite recipes yet' translation key to multiple locales and use it in the favorite recipes client. ([51f7369](https://github.com/marosdaniel/cookbook-next/commit/51f7369ee6c6342da27d27a40c6d07d94583e3da))

# [2.18.0](https://github.com/marosdaniel/cookbook-next/compare/v2.17.0...v2.18.0) (2026-03-24)


### Features

* introduce a header search component and display it in the application shell. ([bc23f09](https://github.com/marosdaniel/cookbook-next/commit/bc23f09ee286c0752430356ca4fac456d0dc52c2))

# [2.17.0](https://github.com/marosdaniel/cookbook-next/compare/v2.16.0...v2.17.0) (2026-03-24)


### Features

* Extend recipe and ingredient models with new fields and refactor login form to use controlled validation. ([bfb13f0](https://github.com/marosdaniel/cookbook-next/commit/bfb13f063e5a816bec2043132d9ab0bb9de5c95a))

# [2.16.0](https://github.com/marosdaniel/cookbook-next/compare/v2.15.0...v2.16.0) (2026-03-23)


### Features

* Implement comprehensive recipe metadata, time fields, text fields, and SEO options for recipe creation and editing. ([05cdfbb](https://github.com/marosdaniel/cookbook-next/commit/05cdfbb28e8d288aac3adcad5fa01bf71dc24705))

# [2.15.0](https://github.com/marosdaniel/cookbook-next/compare/v2.14.0...v2.15.0) (2026-03-16)


### Features

* Introduce shared recipe types and a reusable BackTo navigation component, replacing the old BackLink. ([c1a0321](https://github.com/marosdaniel/cookbook-next/commit/c1a0321a50dd97c47d1a335913a738d0f2979341))

# [2.14.0](https://github.com/marosdaniel/cookbook-next/compare/v2.13.0...v2.14.0) (2026-03-16)


### Features

* Introduce recipe detail page, route, and translations, extracting difficulty color logic to a utility. ([8ae8fbe](https://github.com/marosdaniel/cookbook-next/commit/8ae8fbe960588d36ef043327810a9cd05f413f8a))
* refactor recipe detail page by extracting logic into a custom hook and breaking down UI into dedicated components. ([c3446e4](https://github.com/marosdaniel/cookbook-next/commit/c3446e4d89aaed479500fb2f10533067892d7c0c))

# [2.13.0](https://github.com/marosdaniel/cookbook-next/compare/v2.12.0...v2.13.0) (2026-03-16)


### Features

* display a loading spinner on the recipe creation page while session is loading. ([4676eef](https://github.com/marosdaniel/cookbook-next/commit/4676eefbfcda6eddd1f3dc802dca31042ae29c91))
* Refactor RecipeSearch to use Mantine form with Zod validation and synchronize filters with URL query parameters. ([583d3ec](https://github.com/marosdaniel/cookbook-next/commit/583d3ec27bc0d964cc348c54ef8863e376b60fda))

# [2.12.0](https://github.com/marosdaniel/cookbook-next/compare/v2.11.0...v2.12.0) (2026-03-15)


### Features

* Add new recipes page displaying recently added recipes. ([6c52175](https://github.com/marosdaniel/cookbook-next/commit/6c52175f02acda5b07b4cd781f40d411c198025f))
* Add recipe search component with advanced filtering options and GraphQL integration. ([800a52c](https://github.com/marosdaniel/cookbook-next/commit/800a52ce94f6d5449124b2f8e5f2546b360c73ba))

# [2.11.0](https://github.com/marosdaniel/cookbook-next/compare/v2.10.0...v2.11.0) (2026-03-15)


### Features

* Implement recipe card, carousel, and favorite recipe management with new GraphQL queries and mutations. ([14c38c0](https://github.com/marosdaniel/cookbook-next/commit/14c38c04b6e64c7fd7a134178b42a5a728a668ef))

# [2.10.0](https://github.com/marosdaniel/cookbook-next/compare/v2.9.0...v2.10.0) (2026-03-09)


### Bug Fixes

* Correct form submission disabling by using `form.isValid()` and handling async results, rather than `form.errors`. ([8b39cab](https://github.com/marosdaniel/cookbook-next/commit/8b39caba81fc4b5d9e38e422c3afb55ccd940b24))
* Set `NEXTAUTH_SECRET` for Playwright's dev server and add error handling to `isFormSubmitDisabled` to prevent crashes. ([796a5c5](https://github.com/marosdaniel/cookbook-next/commit/796a5c55693f9b433edfdb85101e50a01cec5508))


### Features

* Implement `isFormSubmitDisabled` utility to standardize form submission button disabling logic and refactor recipe composer types. ([0b0a3c8](https://github.com/marosdaniel/cookbook-next/commit/0b0a3c8da425c29d653aa01ca0be41f1bce47d08))

# [2.9.0](https://github.com/marosdaniel/cookbook-next/compare/v2.8.0...v2.9.0) (2026-03-09)


### Features

* Add documentation for Neon (Postgres) integration and Playwright E2E tests, updating the README. ([9bd81f0](https://github.com/marosdaniel/cookbook-next/commit/9bd81f0f851f7259a01cc123802b95e07330f1d2))

# [2.8.0](https://github.com/marosdaniel/cookbook-next/compare/v2.7.0...v2.8.0) (2026-03-09)


### Features

* Add `json-summary` reporter to Vitest and enhance coverage report parsing in the deploy workflow. ([d2cbe6e](https://github.com/marosdaniel/cookbook-next/commit/d2cbe6e81d6016a0e197ebbd00464b63d028f491))
* Validate empty body for GraphQL API requests and configure allowed development origins. ([01810d0](https://github.com/marosdaniel/cookbook-next/commit/01810d0ac75e1329e3daad82cc2858430279abb3))

# [2.7.0](https://github.com/marosdaniel/cookbook-next/compare/v2.6.0...v2.7.0) (2026-03-09)


### Features

* add Playwright for end-to-end testing and integrate into the CI pipeline. ([0ec8a5c](https://github.com/marosdaniel/cookbook-next/commit/0ec8a5c7c580e6cafc57a9a42d24bbb31871e104))
* Restructure Playwright E2E tests, add JSON reporting, and enhance CI deployment of all test reports while fixing a LoginForm test. ([1eca9a6](https://github.com/marosdaniel/cookbook-next/commit/1eca9a6350fddbfaf807b83570ed1ba715b32bd1))

# [2.6.0](https://github.com/marosdaniel/cookbook-next/compare/v2.5.0...v2.6.0) (2026-03-08)


### Features

* Standardize user mutation error handling and validation, introduce dedicated input types, and remove specific metadata GraphQL queries. ([3d59cf9](https://github.com/marosdaniel/cookbook-next/commit/3d59cf90615c6b5dd7c7ee35ecbf605b8b74f8df))

# [2.5.0](https://github.com/marosdaniel/cookbook-next/compare/v2.4.0...v2.5.0) (2026-03-08)


### Features

* Add German translations for recipe rating messages. ([00da173](https://github.com/marosdaniel/cookbook-next/commit/00da17332e252c1acdf96b03e4e6de0657f8bb6b))
* implement recipe rating functionality with new UI component, GraphQL mutations, and resolvers ([e07a928](https://github.com/marosdaniel/cookbook-next/commit/e07a9280022355de82e14f065d045bda7aa9bdec))

# [2.4.0](https://github.com/marosdaniel/cookbook-next/compare/v2.3.0...v2.4.0) (2026-03-08)


### Features

* Integrate Mantine Spotlight and ModalsProvider, including new styles and dependencies. ([347dbdf](https://github.com/marosdaniel/cookbook-next/commit/347dbdf0bd00d7894a2a01eb1e63afb9f671d318))

# [2.3.0](https://github.com/marosdaniel/cookbook-next/compare/v2.2.0...v2.3.0) (2026-03-08)


### Features

* Upgrade Mantine packages to v9 alpha, updating Collapse component prop and importing carousel styles. ([8364906](https://github.com/marosdaniel/cookbook-next/commit/83649069c39a83486fb0e4e97e5070e3b66a8ae1))

# [2.2.0](https://github.com/marosdaniel/cookbook-next/compare/v2.1.0...v2.2.0) (2026-03-07)


### Features

* migrate metadata from database to static in-memory data structure and update related resolvers and utilities ([b186333](https://github.com/marosdaniel/cookbook-next/commit/b186333dea86af7dbd1813150acff3d1c2c67898))

# [2.1.0](https://github.com/marosdaniel/cookbook-next/compare/v2.0.0...v2.1.0) (2026-03-07)


### Features

* Configure DATABASE_URL for build and test steps, update typecheck command, and add Prisma migration to deploy workflow. ([51fb70f](https://github.com/marosdaniel/cookbook-next/commit/51fb70f63f45fb21603fd688a7ad81117411d1b0))

# [2.0.0](https://github.com/marosdaniel/cookbook-next/compare/v1.40.1...v2.0.0) (2026-03-07)


* feat!: migrate database from MongoDB to Neon PostgreSQL and Prisma 7 ([285ce49](https://github.com/marosdaniel/cookbook-next/commit/285ce490444a631ade63f21064bfb45d77c38275))


### BREAKING CHANGES

* Complete database provider shift.
- Replaced MongoDB with Neon PostgreSQL (Frankfurt region).
- Upgraded Prisma to v7.4.2 and implemented the Neon serverless adapter.
- Redesigned the schema: Ingredients and PreparationSteps are now relational tables.
- Switched IDs from MongoDB ObjectIDs to CUIDs across the entire system.
- Moved Metadata model offline to JSON for better flexibility.
- Removed all MongoDB-related dependencies and utilities.

## [1.40.1](https://github.com/marosdaniel/cookbook-next/compare/v1.40.0...v1.40.1) (2026-03-05)


### Bug Fixes

* Update Mantine packages to version 8.3.16. ([465cfdf](https://github.com/marosdaniel/cookbook-next/commit/465cfdf4e7d4ad99ebec10e3f54119eef7e9c1e4))

# [1.40.0](https://github.com/marosdaniel/cookbook-next/compare/v1.39.0...v1.40.0) (2026-03-03)


### Features

* update `@tabler/icons-react` and `@semantic-release/npm` dependencies ([10546a9](https://github.com/marosdaniel/cookbook-next/commit/10546a90911d2c72cfb94a076e938e0c6ee2dfde))

# [1.39.0](https://github.com/marosdaniel/cookbook-next/compare/v1.38.0...v1.39.0) (2026-02-27)


### Features

* Implement recipe editing functionality and refactor the recipe composer to support both creation and editing. ([acd2328](https://github.com/marosdaniel/cookbook-next/commit/acd2328c729e0205f426b89008c0082876909c61))

# [1.38.0](https://github.com/marosdaniel/cookbook-next/compare/v1.37.0...v1.38.0) (2026-02-23)


### Features

* Improve translation of "Saved X minutes ago" by passing minutes as a variable to the translation function and adding error handling. ([fb0f000](https://github.com/marosdaniel/cookbook-next/commit/fb0f0009e56a549d1a9773aa9d7df85071f715b3))

# [1.37.0](https://github.com/marosdaniel/cookbook-next/compare/v1.36.0...v1.37.0) (2026-02-15)


### Features

* Add i18n support to recipe composer sections by introducing new translation keys and integrating `next-intl`. ([1b0800c](https://github.com/marosdaniel/cookbook-next/commit/1b0800ce71a30cee1625073beeb24fee77c1f1d0))

# [1.36.0](https://github.com/marosdaniel/cookbook-next/compare/v1.35.0...v1.36.0) (2026-02-15)


### Features

* Introduce recipe creation with GraphQL mutation, local draft saving, and internationalized success/error notifications. ([92afa90](https://github.com/marosdaniel/cookbook-next/commit/92afa907e77380f11f0383c8dd0571aad7b8ef8b))

# [1.35.0](https://github.com/marosdaniel/cookbook-next/compare/v1.34.0...v1.35.0) (2026-02-10)


### Features

* Implement recipe creation feature with new metadata management, SEO utilities, and updated GraphQL resolvers. ([8730f4d](https://github.com/marosdaniel/cookbook-next/commit/8730f4d1d1b87a970458c1984c592282cbe762d8))

# [1.34.0](https://github.com/marosdaniel/cookbook-next/compare/v1.33.0...v1.34.0) (2025-12-29)


### Features

* add unit tests for authentication logic, NextAuth configuration, and middleware. ([90bebc2](https://github.com/marosdaniel/cookbook-next/commit/90bebc2aadc817f85e7eedbf8bc5c6c8d051d8eb))

# [1.33.0](https://github.com/marosdaniel/cookbook-next/compare/v1.32.0...v1.33.0) (2025-12-26)


### Features

* Implement user-specific recipe and following pages, introduce new `StyledText`, `NavButton`, and `UnderConstruction` components, and refactor `AuthButton`. ([d3daf32](https://github.com/marosdaniel/cookbook-next/commit/d3daf32b19cfbef51472b57f5a84a45ff939f4f8))

# [1.32.0](https://github.com/marosdaniel/cookbook-next/compare/v1.31.0...v1.32.0) (2025-12-26)


### Features

* Implement user profile page with personal data and password management, protected by new authentication middleware and configuration. ([7a35d66](https://github.com/marosdaniel/cookbook-next/commit/7a35d66ed98909c36ebe5e3de50cd0d9c7a89d37))
* Refactor user GraphQL mutations and queries to use Prisma, update user types, and adjust password change UI. ([49758dd](https://github.com/marosdaniel/cookbook-next/commit/49758dd8ea48dfc372da837ebd43ff48e6262e03))

# [1.31.0](https://github.com/marosdaniel/cookbook-next/compare/v1.30.1...v1.31.0) (2025-12-18)


### Features

* Implement UserButton and NavbarLinksGroup components, add new navigation routes, and update localization keys. ([9f89db2](https://github.com/marosdaniel/cookbook-next/commit/9f89db292c45eebed4e2290c49923b9faa1d3bd2))

## [1.30.1](https://github.com/marosdaniel/cookbook-next/compare/v1.30.0...v1.30.1) (2025-12-15)


### Bug Fixes

* adjust expected chef hat icon opacity in not-found test. ([9e6dcd3](https://github.com/marosdaniel/cookbook-next/commit/9e6dcd38a2b19a6e38e800702bc883efa9a87046))

# [1.30.0](https://github.com/marosdaniel/cookbook-next/compare/v1.29.0...v1.30.0) (2025-12-15)


### Features

* Enhance theme management for SSR, add German legal content translations, and update dependencies. ([3bb7fe4](https://github.com/marosdaniel/cookbook-next/commit/3bb7fe42f16e61fdef24c8d05e7290bba0282428))

# [1.29.0](https://github.com/marosdaniel/cookbook-next/compare/v1.28.0...v1.29.0) (2025-12-14)


### Features

* Dynamically render and internationalize Privacy and Cookie Policy pages with enhanced SEO. ([0ec1de8](https://github.com/marosdaniel/cookbook-next/commit/0ec1de8baae68e53645d8f51470fc87b4fe7809e))
* support string arrays in `LocaleMessages` type ([2b72471](https://github.com/marosdaniel/cookbook-next/commit/2b724712678f70bd7c181772a44d88eee74a5cf0))

# [1.28.0](https://github.com/marosdaniel/cookbook-next/compare/v1.27.0...v1.28.0) (2025-12-11)


### Features

* Add optional `href` prop to the `Logo` component, making header and footer logos link to the home page. ([6fdf72d](https://github.com/marosdaniel/cookbook-next/commit/6fdf72d9aff0a13af2bafe74289f7ed4b6ad2989))
* Add Privacy Policy and Cookie Policy pages, and standardize public and authentication route definitions. ([877641a](https://github.com/marosdaniel/cookbook-next/commit/877641aab788dd3bdef8ae63ce15235d881ad535))

# [1.27.0](https://github.com/marosdaniel/cookbook-next/compare/v1.26.0...v1.27.0) (2025-12-11)


### Features

* Implement responsive footer layout with increased logo size and adjust shell main content padding and footer height. ([4315670](https://github.com/marosdaniel/cookbook-next/commit/4315670df17490761a41e834832565083803ff9a))

# [1.26.0](https://github.com/marosdaniel/cookbook-next/compare/v1.25.0...v1.26.0) (2025-12-11)


### Features

* enhance Logo component with optional text display and mobile visibility control. ([6ebcfd8](https://github.com/marosdaniel/cookbook-next/commit/6ebcfd8071fbf6b7a6a3d4ad137427f2000903c4))

# [1.25.0](https://github.com/marosdaniel/cookbook-next/compare/v1.24.0...v1.25.0) (2025-12-11)


### Features

* add Footer component to Shell and update Prisma and Node.js types dependencies. ([035fcb1](https://github.com/marosdaniel/cookbook-next/commit/035fcb111c2d08f7e1dd6f30fd2bc1381e8679eb))

# [1.24.0](https://github.com/marosdaniel/cookbook-next/compare/v1.23.0...v1.24.0) (2025-12-10)


### Features

* update default user locale from 'en' to 'en-gb' ([21c0451](https://github.com/marosdaniel/cookbook-next/commit/21c0451cee070d1f863ba5012bc94a96270b8a72))

# [1.23.0](https://github.com/marosdaniel/cookbook-next/compare/v1.22.0...v1.23.0) (2025-12-10)


### Features

* Add `setNewPasswordTitle` and `setNewPasswordDescription` to SEO interface. ([ff7e61d](https://github.com/marosdaniel/cookbook-next/commit/ff7e61d1c64afe25eb6beeafd40bbbbc4da310a6))
* Add new password UI messages, update password reset documentation, and adjust validation error key. ([759ad3a](https://github.com/marosdaniel/cookbook-next/commit/759ad3a4ba46cad5773c359c1b6bde60f9ccaca2))
* Implement full password reset functionality with email templates, new password form, and GraphQL resolvers. ([f363481](https://github.com/marosdaniel/cookbook-next/commit/f363481319a291d8bb991e65bbcaa571e5aa2702))
* Update signup form test to verify auto-login and redirect to home page after successful account creation. ([827c10d](https://github.com/marosdaniel/cookbook-next/commit/827c10d29aa369370078dc78fe11f6e31c269612))

# [1.22.0](https://github.com/marosdaniel/cookbook-next/compare/v1.21.0...v1.22.0) (2025-12-10)


### Features

* Implement and document CI skip logic for GitHub Actions based on file paths and commit messages. ([1cd4598](https://github.com/marosdaniel/cookbook-next/commit/1cd459806eb729d127d629c35105d1a02b91c2b2))

# [1.21.0](https://github.com/marosdaniel/cookbook-next/compare/v1.20.0...v1.21.0) (2025-12-09)


### Features

* Upgrade to NextAuth v5 (Auth.js) by refactoring authentication logic and updating dependencies. ([23af585](https://github.com/marosdaniel/cookbook-next/commit/23af58533b29433c33f2c70ac732ee1037059efe))

# [1.20.0](https://github.com/marosdaniel/cookbook-next/compare/v1.19.0...v1.20.0) (2025-12-05)


### Features

* Introduce an internationalized 404 Not Found page, including new UI elements, dedicated tests, and updated localization files. ([38030d7](https://github.com/marosdaniel/cookbook-next/commit/38030d7418e4e65a78b13beab7ea1797fc76244c))

# [1.19.0](https://github.com/marosdaniel/cookbook-next/compare/v1.18.0...v1.19.0) (2025-12-05)


### Features

* Refine `AppShell` layout for authentication pages and implement hydration-safe theme switching. ([5185b3c](https://github.com/marosdaniel/cookbook-next/commit/5185b3c8e2b02bfa4eb310100ef7abe6a103db0f))

# [1.18.0](https://github.com/marosdaniel/cookbook-next/compare/v1.17.0...v1.18.0) (2025-12-05)


### Features

* add theme switcher component with i18n and Redux state management. ([b2b70c5](https://github.com/marosdaniel/cookbook-next/commit/b2b70c540c621608f0c10e4f86cab56a9e6f227d))

# [1.17.0](https://github.com/marosdaniel/cookbook-next/compare/v1.16.0...v1.17.0) (2025-12-05)


### Features

* Add tests for AuthLayout, LoginForm, and SignUpForm components. ([879d31f](https://github.com/marosdaniel/cookbook-next/commit/879d31f85fd6b19366b65ef216c25812d367a8bc))

# [1.16.0](https://github.com/marosdaniel/cookbook-next/compare/v1.15.0...v1.16.0) (2025-12-05)


### Features

* Implement `useTransition` for navigation and sign-out actions with loading states, and extract `AuthButton` types. ([9694088](https://github.com/marosdaniel/cookbook-next/commit/9694088b1776c8b71ed034d6de5394382defa918))

# [1.15.0](https://github.com/marosdaniel/cookbook-next/compare/v1.14.0...v1.15.0) (2025-12-05)


### Features

* Introduce `noImgElement` lint rule (disabled in tests) and expand `Logo` component test coverage for color scheme and sizing. ([e587f0d](https://github.com/marosdaniel/cookbook-next/commit/e587f0d2917a3f01ac23ce5f6bf00690323f133b))

# [1.14.0](https://github.com/marosdaniel/cookbook-next/compare/v1.13.0...v1.14.0) (2025-12-05)


### Features

* Enhance favicon and app icon configuration and refactor Logo component for theme-based variants. ([eb5d63c](https://github.com/marosdaniel/cookbook-next/commit/eb5d63ccb11a20f707e43930fad342b2685ff81e))
* Introduce image-based logos with dark/light mode switching and add complete favicon and PWA assets. ([8624f96](https://github.com/marosdaniel/cookbook-next/commit/8624f96b7e0448a3d00ef26070f33eac8f388981))

# [1.13.0](https://github.com/marosdaniel/cookbook-next/compare/v1.12.0...v1.13.0) (2025-12-03)


### Features

* Add new translation keys for login, signup, and password reset messages in German and Hungarian. ([2513c2b](https://github.com/marosdaniel/cookbook-next/commit/2513c2bcc7bc389baa84eb144a712f2dccdb2a35))

# [1.12.0](https://github.com/marosdaniel/cookbook-next/compare/v1.11.0...v1.12.0) (2025-12-03)


### Features

* Add `AuthButton` and `Navbar` components, integrating them into the `Shell` for authentication and navigation. ([635c59d](https://github.com/marosdaniel/cookbook-next/commit/635c59dd948e04ef2bfeb3cf4ee55109ac0e80c4))
* add positioning, transition, and closing behavior props to LanguageSelector Menu. ([495a07b](https://github.com/marosdaniel/cookbook-next/commit/495a07b3fa4045a53dbfd3dd2453286f727a41d5))

# [1.11.0](https://github.com/marosdaniel/cookbook-next/compare/v1.10.0...v1.11.0) (2025-12-03)


### Features

* Replace generic 'en' locale with 'en-gb' and update all related configurations and files. ([b201570](https://github.com/marosdaniel/cookbook-next/commit/b20157056269df871a3429d517e6c99e43e0052d))

# [1.10.0](https://github.com/marosdaniel/cookbook-next/compare/v1.9.0...v1.10.0) (2025-12-02)


### Features

* Add reset password functionality and centralize locale utility to `lib/locale`. ([caec11d](https://github.com/marosdaniel/cookbook-next/commit/caec11db3ab4b9e179f0e355dafb32fb3000f455))

# [1.9.0](https://github.com/marosdaniel/cookbook-next/compare/v1.8.0...v1.9.0) (2025-12-01)


### Features

* add happy-dom as Vitest environment and introduce tests for LanguageSelector and PrivacyPolicyLink components ([70b5115](https://github.com/marosdaniel/cookbook-next/commit/70b5115f94274727f748ee3211c2a5a2416ec9e8))

# [1.8.0](https://github.com/marosdaniel/cookbook-next/compare/v1.7.0...v1.8.0) (2025-11-30)


### Features

* Define and consume centralized application route and i18n language constants. ([1e58270](https://github.com/marosdaniel/cookbook-next/commit/1e58270b2f3729ae02693aee948bd3cff32b3ada))

# [1.7.0](https://github.com/marosdaniel/cookbook-next/compare/v1.6.0...v1.7.0) (2025-11-29)


### Features

* Add language selector with dynamic locale management and localized SEO metadata. ([720cc6f](https://github.com/marosdaniel/cookbook-next/commit/720cc6f76854ae2a5b2d738f0fcab62339d28990))
* Implement 404 page, refactor authentication metadata to use dynamic locale fetching with `force-dynamic`, and disable Next.js component caching. ([3d34576](https://github.com/marosdaniel/cookbook-next/commit/3d34576059026e93735bc4e23d8bcda2aa21e7b1))

# [1.6.0](https://github.com/marosdaniel/cookbook-next/compare/v1.5.0...v1.6.0) (2025-11-29)


### Features

* Disable shell navigation components on authentication routes and add `baseline-browser-mapping` dependency. ([a8d7671](https://github.com/marosdaniel/cookbook-next/commit/a8d7671e103e0bd4f7c93cf0d50b563837b64b8c))

# [1.5.0](https://github.com/marosdaniel/cookbook-next/compare/v1.4.0...v1.5.0) (2025-11-25)


### Features

* Dynamically generate authentication page metadata using new translated descriptions. ([fdacf22](https://github.com/marosdaniel/cookbook-next/commit/fdacf222f94df75b1badcbe5422f76fe226f65dd))

# [1.4.0](https://github.com/marosdaniel/cookbook-next/compare/v1.3.0...v1.4.0) (2025-11-24)


### Features

* Relocate NextTopLoader to Mantine provider with theme-based color and remove comments from deploy workflow. ([3b9826a](https://github.com/marosdaniel/cookbook-next/commit/3b9826a99138b9fdc2f7dd3c840b7864ec3142fa))

# [1.3.0](https://github.com/marosdaniel/cookbook-next/compare/v1.2.0...v1.3.0) (2025-11-24)


### Features

* add automated release workflow using semantic-release ([8e0e6f3](https://github.com/marosdaniel/cookbook-next/commit/8e0e6f34de6fcd4e97469227e85aed768f884ac0))
* add CREATE_USER GraphQL mutation and refactor its usage in the signup form. ([ef07607](https://github.com/marosdaniel/cookbook-next/commit/ef07607ed8b529bfbb0798f2f8d5f7097c3c4c45))
* add manual trigger for deploy workflow ([76d0293](https://github.com/marosdaniel/cookbook-next/commit/76d02935354b34d28011528349b3e649659b67e5))
* display detailed coverage metrics in README via dynamic badges and generate coverage summary in workflow ([5cfc947](https://github.com/marosdaniel/cookbook-next/commit/5cfc94787481f87544978abe38b11baed20123a7))
* Implement GitHub Pages deployment for coverage reports by refactoring the deploy workflow and updating the README link. ([dda2cce](https://github.com/marosdaniel/cookbook-next/commit/dda2cce9d8feca67fbd9dd166e639c34e3ba107c))
* Implement privacy policy validation for signup, add global loading indicator, and update i18n messages. ([ae8638e](https://github.com/marosdaniel/cookbook-next/commit/ae8638ea9db08d0deee7fa02536593c8ba8df261))

# [1.2.0](https://github.com/marosdaniel/cookbook-next/compare/v1.1.0...v1.2.0) (2025-11-23)


### Features

* add Vitest test coverage reporting, configuration, and documentation ([24bb9e4](https://github.com/marosdaniel/cookbook-next/commit/24bb9e4e9e47500aebeca9a5c2e7debf80734520))

# [1.1.0](https://github.com/marosdaniel/cookbook-next/compare/v1.0.0...v1.1.0) (2025-11-23)


### Features

* introduce Vitest for unit and integration testing with CI integration and make Logo headingSize optional. ([a1476d4](https://github.com/marosdaniel/cookbook-next/commit/a1476d44a62bf7730bdf66d3a996bedc5ff230a2))

# 1.0.0 (2025-11-23)


### Features

* add semantic-release configuration and workflow for automated releases ([c0cb02c](https://github.com/marosdaniel/cookbook-next/commit/c0cb02c478fcab47fd9b5850a0fb656f186a3051))
* Extend NextAuth session types with `rememberMe` and `maxAge`, refactor Logo component types, and update Mantine dependencies. ([ee9c8ec](https://github.com/marosdaniel/cookbook-next/commit/ee9c8ec7b4ab480093417891f32719e5e506cfc7))
* Introduce CI checks for linting and type checking, and disable `noImplicitAny` in `tsconfig`. ([d2eb394](https://github.com/marosdaniel/cookbook-next/commit/d2eb39421a7bad75b40b76c829f88a24a99e39a3))
