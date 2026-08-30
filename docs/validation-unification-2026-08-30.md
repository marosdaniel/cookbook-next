# ✅ Cookbook-Next — Egységes validáció (frontend + backend)

> **Dátum**: 2026-08-30
> **Kiindulás**: a feladat feltételezte, hogy a validációs szabályok duplikálva vannak kliens- és szerveroldalon. **A vizsgálat ezt részben cáfolta** — a helyzet jobb a vártnál, de van egy jelentős rés.

---

## 1. Tényleges állapot (kód-evidenciával)

### 1.1 User-flow-k: a megosztás MÁR MEGVAN ✅

A [UserService.ts](../src/lib/services/UserService.ts) **ugyanazokat** a Zod sémákat importálja és futtatja, mint a kliens-formok:

| Séma ([validation.ts](../src/lib/validation/validation.ts)) | Kliens-használat (zodResolver) | Szerver-használat (UserService) |
|---|---|---|
| `customValidationSchema` | — (a signup a `signUpValidationSchema`-t használja) | `createUser` → `.parse()` (L175) |
| `signUpValidationSchema` | [SignUpForm.tsx](../src/app/(auth)/signup/SignUpForm.tsx) | — (a `privacyAccepted` kliens-only, lásd 2.2) |
| `passwordEditValidationSchema` | [Password.tsx](../src/app/me/profile/Password/Password.tsx) | `changePassword` → `.safeParse()` (L268) |
| `resetPasswordValidationSchema` | [ResetPasswordForm.tsx](../src/app/(auth)/reset-password/ResetPasswordForm.tsx) | `resetPassword` → `.safeParse()` (L308) |
| `setNewPasswordValidationSchema` | [SetNewPasswordForm.tsx](../src/app/(auth)/reset-password/[token]/SetNewPasswordForm.tsx) | `setNewPassword` → `.safeParse()` (L369) |
| `nameValidationSchema` | [PersonalData.tsx](../src/app/me/profile/PersonalData/PersonalData.tsx) | `updateUser` → `.parse()` (L430) |

A jelszó-policy (`STRONG_PASSWORD_REGEX`: min 8, kis-/nagybetű, szám, speciális) **egyetlen helyen** él. Ez az audit-doksik „duplikáció-gyanúját” lezárja: **user-oldalon nincs duplikáció.**

### 1.2 Recept-flow: itt VAN rés ❌

| Réteg | Mi validál | Evidencia |
|---|---|---|
| Kliens | `recipeFormValidationSchema` (teljes: hosszak, URL-formátum, pozitív számok, YouTube-regex, slug-regex, SEO-limitek) | [useRecipeForm.tsx](../src/components/Recipe/Create/hooks/useRecipeForm.tsx), [useRecipeEditForm.tsx](../src/components/Recipe/Create/hooks/useRecipeEditForm.tsx) |
| Szerver | Csak kézi jelenlét-ellenőrzés (`validateRequiredFields`: 7 mező truthy-check) + sanitizálás | [resolvers/recipe/utils.ts](../src/lib/graphql/resolvers/recipe/utils.ts#L43) |

Következmény: egy közvetlen GraphQL-hívás (a persisted-allowlist a saját kliensünket védi, de a mutation-t jogosult user bármilyen értékkel hívhatja a regisztrált dokumentumon keresztül) átvihet:
- negatív/0 `cookingTime`/`servings`/`quantity` értéket,
- érvénytelen `imgSrc`/`socialImage` URL-t (nem-URL string),
- 60+ karakteres `seoTitle`-t, formátum-sértő `slug`-ot,
- érvénytelen YouTube-linket (a JSON-LD VideoObject-validátor ezt később kiszűri, de a DB-be bekerül).

A sanitizálás (strip-tags) ezt **nem** fedi le — az XSS-t kezeli, a strukturális érvényességet nem.

### 1.3 Kisebb rendezetlenségek

- A `validation.ts`-ben a jelszó-mező szabálya **négyszer** van leírva (a `passwordField` mellett a `newPasswordValidationSchema` és `setNewPasswordValidationSchema` inline ismétli, utóbbi ráadásul `max(64)` nélkül — **belső inkonzisztencia**).
- A `WEAK_PASSWORD_REGEX` már csak tesztből hivatkozott — kivezethető.
- Kliens-only mezők (confirm-mezők, `privacyAccepted`) és szerver-releváns szabályok egy fájlban keverednek.

## 2. Célarchitektúra

### 2.1 Fájlstruktúra

```
src/lib/validation/
├── shared/                    ← ÚJ: izomorf atomok + entitás-sémák (se React, se Prisma import!)
│   ├── atoms.ts               ← passwordSchema, emailSchema, nameSchema, userNameSchema, urlOrEmpty…
│   ├── user.ts                ← userRegisterSchema, passwordChangeSchema… (szerver-shape)
│   ├── recipe.ts              ← recipeInputSchema (GraphQL input shape!)
│   └── index.ts
├── forms/                     ← ÚJ: kliens-form sémák (confirm-mezők, privacyAccepted, Mantine-shape)
│   ├── auth.ts
│   ├── profile.ts
│   └── recipe.ts
├── validation.ts              ← átmenetileg re-export réteg (deprecated), később törölhető
└── (errorCatalog, throwCustomError, zodResolver… változatlan)
```

Elv: a **shared** réteg a „mit jelent egy érvényes érték” tudást tartalmazza; a **forms** réteg a UI-specifikus kompozíciót (confirm-párok, checkbox-literálok, `z.coerce` a szöveges inputokhoz).

### 2.2 Atomok

```ts
// src/lib/validation/shared/atoms.ts
import { z } from 'zod';

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})/;

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(64, 'Password must be at most 64 characters')
  .regex(
    STRONG_PASSWORD_REGEX,
    'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  );

export const emailSchema = z.email({ message: 'Invalid email address' });

export const personNameSchema = z
  .string()
  .min(2, 'Too Short!')
  .regex(/^\D+$/, 'should not contain numbers');

export const userNameSchema = z
  .string()
  .min(3, 'Minumum 3 chars needed')
  .max(20, 'Maximum 20 chars allowed');

export const urlOrEmptySchema = z.url({ message: 'Invalid URL' }).optional().or(z.literal(''));

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]*$/, 'Only lowercase letters, numbers and hyphens');
```

**Jelszó-kontextus kezelése** (a feladat külön kérdése): a `passwordSchema` kizárólag *plaintext user-inputra* való (regisztráció, jelszóváltás, login-form). A már hashelt jelszó sosem megy át rajta — a hash-elés a `hashPassword()`-ben történik a validáció UTÁN, a szerver-sémák pedig a *bemeneti* DTO-t validálják, nem a DB-rekordot. Ezért nincs szükség „hash-toleráns” sémára; a határvonal: **séma = transport-input, nem persistence-modell.**

### 2.3 Szerveroldali recept-séma (a rés zárása)

A kliens-form sémája NEM újrahasználható 1:1 (más a shape: `difficultyLevel: {value,label}` option-objektum + `z.coerce` stringes inputokhoz), ezért a GraphQL input saját sémát kap **ugyanazokból az atomokból**:

```ts
// src/lib/validation/shared/recipe.ts
import { z } from 'zod';
import { slugSchema, urlOrEmptySchema } from './atoms';

const taxonomyInputSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const recipeIngredientInputSchema = z.object({
  localId: z.string().optional(),
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  isOptional: z.boolean().optional(),
  note: z.string().max(500).optional().nullable(),
});

export const recipeInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  imgSrc: urlOrEmptySchema.nullable(),
  cookingTime: z.number().int().positive(),
  servings: z.number().int().positive(),
  category: taxonomyInputSchema,
  difficultyLevel: taxonomyInputSchema,
  labels: z.array(z.string()).max(20),
  ingredients: z.array(recipeIngredientInputSchema).min(1).max(100),
  preparationSteps: z
    .array(z.object({ localId: z.string().optional(), description: z.string().min(1).max(2000), order: z.number().int() }))
    .min(1)
    .max(50),
  youtubeLink: z
    .string()
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, 'Invalid YouTube URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  prepTimeMinutes: z.number().int().min(0).optional().nullable(),
  cookTimeMinutes: z.number().int().min(0).optional().nullable(),
  restTimeMinutes: z.number().int().min(0).optional().nullable(),
  servingUnit: taxonomyInputSchema.optional().nullable(),
  cuisine: taxonomyInputSchema.optional().nullable(),
  dietaryFlags: z.array(z.string()).max(20).optional(),
  allergens: z.array(z.string()).max(20).optional(),
  equipment: z.array(z.string()).max(20).optional(),
  costLevel: taxonomyInputSchema.optional().nullable(),
  tips: z.string().max(5000).optional().nullable().or(z.literal('')),
  substitutions: z.string().max(5000).optional().nullable().or(z.literal('')),
  slug: slugSchema.optional().or(z.literal('')),
  seoTitle: z.string().max(60).optional().nullable().or(z.literal('')),
  seoDescription: z.string().max(160).optional().nullable().or(z.literal('')),
  socialImage: urlOrEmptySchema.nullable(),
});

export type RecipeInputParsed = z.infer<typeof recipeInputSchema>;
```

Bekötés a resolver-utilba (a kézi check helyére):

```ts
// src/lib/graphql/resolvers/recipe/utils.ts
import { recipeInputSchema } from '@/lib/validation/shared/recipe';

export const validateRecipeInput = (input: RecipeInputBase) => {
  const result = recipeInputSchema.safeParse(input);
  if (!result.success) {
    throwCustomError(
      `Invalid recipe input: ${result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      ErrorTypes.BAD_REQUEST,
    );
  }
  return result.data;
};
```

Megjegyzés: az itt bevezetett `max()` felső korlátok **új** szabályok (DoS/adathigiénia) — a kliens-form sémába is fel kell venni őket, hogy a user a formban kapjon hibát, ne a szervertől.

### 2.4 Form-sémák: kompozíció atomokból

```ts
// src/lib/validation/forms/auth.ts
import { z } from 'zod';
import { emailSchema, passwordSchema, personNameSchema, userNameSchema } from '../shared/atoms';

const withPasswordConfirm = <S extends z.ZodRawShape>(shape: S, confirmField: string, passwordField: string) =>
  z.object(shape).refine((data) => data[passwordField] === data[confirmField], {
    message: 'Passwords must match',
    path: [confirmField],
  });

export const loginValidationSchema = z.object({ email: emailSchema, password: passwordSchema });

export const signUpValidationSchema = withPasswordConfirm(
  {
    firstName: personNameSchema,
    lastName: personNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    userName: userNameSchema,
    privacyAccepted: z.literal(true, { error: 'You must accept the privacy policy' }),
  },
  'confirmPassword',
  'password',
);
// … passwordEdit / setNewPassword / newPassword ugyanígy — mind a KÖZÖS passwordSchema-ból
```

Ezzel a `setNewPasswordValidationSchema` jelenlegi `max(64)`-hiánya automatikusan megszűnik (a közös atom tartalmazza).

## 3. Migrációs lépések (TS-hibamentes sorrend)

| Lépés | Művelet | Érintett fájlok | Kockázat |
|---|---|---|---|
| 1 | `shared/atoms.ts` létrehozása; a `validation.ts` a saját inline definíciói HELYETT az atomokból komponál (a publikus exportnevek változatlanok!) | `validation.ts`, új `shared/` | Nulla — az export-felület azonos, a meglévő 6 kliens- és 5 szerver-import érintetlen |
| 2 | Unit tesztek futtatása (`validation.test.ts` a viselkedés-kontraktot őrzi; a `setNewPassword` max-64 új viselkedés — teszt frissítendő) | `validation.test.ts` | Alacsony |
| 3 | `shared/recipe.ts` + `validateRecipeInput` bekötése a `createRecipe`/`editRecipe` útvonalba a `validateRequiredFields` helyére | `resolvers/recipe/utils.ts`, mutation-resolverek | Közepes — meglévő (érvénytelen) adatot nem érint, csak új írásokat |
| 4 | A kliens-form séma (`recipeFormValidationSchema`) kiegészítése az új max-korlátokkal, és átköltöztetés `forms/recipe.ts`-be (re-export a régi helyről) | `validation.ts`, `forms/recipe.ts` | Alacsony |
| 5 | Auth/profil form-sémák átköltöztetése `forms/auth.ts`/`forms/profile.ts`-be, `validation.ts` = re-export réteg `@deprecated` kommenttel | formok, `validation.ts` | Alacsony |
| 6 | Import-útvonalak átállítása (`@/lib/validation` barrel frissítése), majd a deprecated re-exportok törlése egy külön PR-ban | 11 fájl | Alacsony |
| 7 | `WEAK_PASSWORD_REGEX` törlése (csak teszt használja) | `validation.ts`, teszt | Nulla |

Minden lépés önállóan shippelhető; a 3. lépés az egyetlen viselkedés-változás (szerver szigorodik) — release note-ot érdemel.

## 4. Őrszabály a jövőre

Biome `noRestrictedImports` szabállyal kikényszeríthető, hogy a `shared/` réteg ne importáljon React/Mantine/Prisma modult — így a réteg garantáltan izomorf marad. (Ingyenes, a meglévő Biome-konfigba illeszthető.)
