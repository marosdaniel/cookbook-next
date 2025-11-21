import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ZodError } from 'zod';
import { USER_REGISTER_MESSAGE_KEYS } from '@/lib/graphql/messageKeys';
import type { IContext } from '@/lib/graphql/types/common';
import type { CreateUserArgs } from '@/lib/graphql/types/user';
import { customValidationSchema } from '@/lib/validation/validation';
import { ErrorTypes } from '../../../../validation/errorCatalog';
import { throwCustomError } from '../../../../validation/throwCustomError';

export const createUser = async (
  { userRegisterInput }: CreateUserArgs,
  { prisma }: IContext,
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

      throwCustomError(firstErrorMessage, ErrorTypes.VALIDATION_ERROR, {
        messageKey: USER_REGISTER_MESSAGE_KEYS.VALIDATION_ERROR,
        details: error.issues,
        originalError: error,
      });
    }
    throwCustomError('Unexpected validation error', ErrorTypes.BAD_REQUEST);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userName }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.userName === userName) {
      throwCustomError('This username is already taken', ErrorTypes.CONFLICT, {
        messageKey: USER_REGISTER_MESSAGE_KEYS.USERNAME_TAKEN,
      });
    }
    if (existingUser.email === email) {
      throwCustomError(
        'This email address is already registered',
        ErrorTypes.CONFLICT,
        { messageKey: USER_REGISTER_MESSAGE_KEYS.EMAIL_TAKEN },
      );
    }
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      locale: locale || 'en',
      role: UserRole.USER,
    },
  });

  return {
    success: true,
    message: 'User successfully created',
    messageKey: USER_REGISTER_MESSAGE_KEYS.SUCCESS,
    statusCode: 201,
  };
};
