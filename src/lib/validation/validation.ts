import { z } from 'zod';

// Password regex patterns
export const PASSWORD_VALIDATOR_REGEX_3_CHAR =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{3,})/;

// Minimum five characters, at least one letter and one number
export const WEAK_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{5,})/;

// Minimum eight characters, at least one letter and one number
export const PASSWORD_VALIDATOR_REGEX_8_CHAR =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})/;

// Minimum eight characters, at least one letter, one number and one special character
export const PASSWORD_VALIDATOR_REGEX_8_CHAR_SPECIAL =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;

export const nameValidationSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Too Short!')
    .regex(/^\D+$/, 'should not contain numbers'),
  lastName: z
    .string()
    .min(2, 'Too Short!')
    .regex(/^\D+$/, 'should not contain numbers'),
});

export const loginValidationSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(5, 'Too Short!')
    .max(20, 'Too Long!')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/,
      'Password must contain at least 5 characters, including at least 1 number',
    ),
});

export const newPasswordValidationSchema = z
  .object({
    newPassword: z
      .string()
      .min(5, 'Too Short!')
      .max(20, 'Too Long!')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/,
        'Password must contain at least 5 characters, including at least 1 number',
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmNewPassword'],
  });

export const resetPasswordValidationSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
});

export const passwordEditValidationSchema = z
  .object({
    currentPassword: z
      .string()
      .min(5, 'Too Short!')
      .max(20, 'Too Long!')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/,
        'Password must contain at least 5 characters, including at least 1 number',
      ),
    newPassword: z
      .string()
      .min(5, 'Too Short!')
      .max(20, 'Too Long!')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/,
        'Password must contain at least 5 characters, including at least 1 number',
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords must match',
    path: ['confirmNewPassword'],
  });

export const customValidationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Too Short!')
      .regex(/^\D+$/, 'should not contain numbers'),
    lastName: z
      .string()
      .min(2, 'Too Short!')
      .regex(/^\D+$/, 'should not contain numbers'),
    email: z.email({ error: 'Invalid email address' }),
    password: z
      .string()
      .min(5, 'Too Short!')
      .max(20, 'Too Long!')
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/,
        'Password must contain at least 5 characters, including at least 1 number',
      ),
    confirmPassword: z.string(),
    userName: z
      .string()
      .min(3, 'Minumum 3 chars needed')
      .max(20, 'Maximum 20 chars allowed'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export const recipeFormValidationSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  imgSrc: z.url({ error: 'Invalid url' }).optional().or(z.literal('')),
  cookingTime: z.number().positive('Required'),
  difficultyLevel: z.object({
    key: z.string().min(1, 'Required'),
    name: z.string().min(1, 'Required'),
    label: z.string().min(1, 'Required'),
  }),
  category: z.object({
    key: z.string().min(1, 'Required'),
    name: z.string().min(1, 'Required'),
    label: z.string().min(1, 'Required'),
  }),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, 'Required'),
      quantity: z.number().positive('Required'),
      unit: z.string().min(1, 'Required'),
    }),
  ),
  steps: z.array(z.string().min(1, 'Required')),
  servings: z.number().positive('Required'),
  youtubeLink: z
    .url({ error: 'Invalid url' })
    .regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//,
      'URL must be a valid YouTube link',
    )
    .optional()
    .or(z.literal('')),
});
