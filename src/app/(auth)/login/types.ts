import type { z } from 'zod';
import type { loginValidationSchema } from '../../../lib/validation';

export type LoginFormValues = z.infer<typeof loginValidationSchema>;
