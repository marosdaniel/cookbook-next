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
