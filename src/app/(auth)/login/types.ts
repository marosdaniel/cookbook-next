import type { z } from 'zod';
import type { loginValidationSchema } from '../../../lib/validation';

export type LoginPageProps = Record<string, never>;

export type LoginFormValues = z.infer<typeof loginValidationSchema>;
