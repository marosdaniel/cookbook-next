import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ZodError } from 'zod';
import { sendWelcomeEmail } from '@/lib/email/nodemailer';
import { USER_REGISTER_MESSAGE_KEYS } from '@/lib/graphql/MESSAGE_KEYS';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { customValidationSchema } from '@/lib/validation/validation';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { CreateUserArgs } from '../../../../../types/user';

export const createUser = async (
  _parent: unknown,
  { userRegisterInput }: CreateUserArgs,
  { prisma }: GraphQLContext,
) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
    confirmPassword,
    locale,
  } = userRegisterInput;

  try {
    customValidationSchema.parse({
      firstName,
      lastName,
      userName,
      email,
      password,
      confirmPassword,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstErrorMessage = error.issues[0]?.message || 'Validation failed';
      return throwCustomError(firstErrorMessage, ErrorTypes.VALIDATION_ERROR, {
        messageKey: USER_REGISTER_MESSAGE_KEYS.VALIDATION_ERROR,
        zodIssues: error.issues,
        originalError: error,
      });
    }
    return throwCustomError(
      'Unexpected validation error',
      ErrorTypes.BAD_REQUEST,
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userName }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.userName.toLowerCase() === userName.toLowerCase()) {
      return throwCustomError(
        'This username is already taken',
        ErrorTypes.CONFLICT,
        {
          messageKey: USER_REGISTER_MESSAGE_KEYS.USERNAME_TAKEN,
        },
      );
    }
    if (existingUser.email.toLowerCase() === email.toLowerCase()) {
      return throwCustomError(
        'This email address is already registered',
        ErrorTypes.CONFLICT,
        { messageKey: USER_REGISTER_MESSAGE_KEYS.EMAIL_TAKEN },
      );
    }
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      locale: locale || 'en-gb',
      role: UserRole.USER,
    },
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(newUser.email, newUser.firstName).catch((error) => {
    console.error('Failed to send welcome email:', error);
  });

  return {
    success: true,
    message: 'User successfully created',
    messageKey: USER_REGISTER_MESSAGE_KEYS.SUCCESS,
    statusCode: 201,
    user: {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      userName: newUser.userName,
      email: newUser.email,
      locale: newUser.locale,
      role: newUser.role,
      recipes: [],
      favoriteRecipes: [],
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    },
  };
};
