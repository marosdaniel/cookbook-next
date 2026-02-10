import { z } from 'zod';

/* ─── Constants ───────────────────────────────── */
// Minimum five characters, at least one letter and one number
export const WEAK_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{5,})/;

// Minimum eight characters, at least one lowercase, one uppercase, one number
export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})/;

/* ─── Shared Schemas ──────────────────────────── */
const nameFields = {
  firstName: z
    .string()
    .min(2, 'Too Short!')
    .regex(/^\D+$/, 'should not contain numbers'),
  lastName: z
    .string()
    .min(2, 'Too Short!')
    .regex(/^\D+$/, 'should not contain numbers'),
};

const emailField = {
  email: z.email({ message: 'Invalid email address' }),
};

const passwordField = {
  password: z
    .string()
    .min(5, 'Too Short!')
    .max(20, 'Too Long!')
    .regex(
      WEAK_PASSWORD_REGEX,
      'Password must contain at least 5 characters, including at least 1 letter and 1 number',
    ),
};

/* ─── User Validation Schemas ─────────────────── */
export const nameValidationSchema = z.object(nameFields);

export const loginValidationSchema = z.object({
  ...emailField,
  ...passwordField,
});

export const resetPasswordValidationSchema = z.object(emailField);

/* ─── Password Change Schemas ─────────────────── */

export const newPasswordValidationSchema = z
  .object({
    newPassword: z
      .string()
      .min(5, 'Too Short!')
      .max(20, 'Too Long!')
      .regex(
        WEAK_PASSWORD_REGEX,
        'Password must contain at least 5 characters, including at least 1 letter and 1 number',
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmNewPassword'],
  });

export const setNewPasswordValidationSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(STRONG_PASSWORD_REGEX, 'Password must adhere to strong policy'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export const passwordEditValidationSchema = z
  .object({
    currentPassword: passwordField.password,
    newPassword: passwordField.password,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmNewPassword'],
  });

/* ─── Registration Schemas ────────────────────── */
const baseUserSchema = z.object({
  ...nameFields,
  ...emailField,
  ...passwordField,
  confirmPassword: z.string(),
  userName: z
    .string()
    .min(3, 'Minumum 3 chars needed')
    .max(20, 'Maximum 20 chars allowed'),
});

export const customValidationSchema = baseUserSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  },
);

export const signUpValidationSchema = baseUserSchema
  .extend({
    privacyAccepted: z.literal(true, {
      error: 'You must accept the privacy policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

/* ─── Recipe Schema ───────────────────────────── */
export const recipeFormValidationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imgSrc: z.url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  cookingTime: z.coerce.number().positive('Must be positive'),
  servings: z.coerce.number().positive('Must be positive'),
  difficultyLevel: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, { message: 'Difficulty is required' }),
  category: z
    .object({
      value: z.string(),
      label: z.string(),
    })
    .nullable()
    .refine((val) => val !== null, { message: 'Category is required' }),
  labels: z.array(z.string()),
  ingredients: z
    .array(
      z.object({
        localId: z.string(),
        name: z.string().min(1, 'Name is required'),
        quantity: z.coerce.number().positive('Must be positive'),
        unit: z.string().min(1, 'Unit is required'),
      }),
    )
    .min(1, 'At least one ingredient is required'),
  preparationSteps: z
    .array(
      z.object({
        localId: z.string().optional(),
        description: z.string().min(1, 'Description is required'),
        order: z.number(),
      }),
    )
    .min(1, 'At least one step is required'),
  youtubeLink: z
    .string()
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      'Invalid YouTube URL',
    )
    .optional()
    .or(z.literal('')),
});
