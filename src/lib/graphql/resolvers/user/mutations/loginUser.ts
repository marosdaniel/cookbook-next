import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErrorTypes } from '@/lib/validation/errorCatalog';
import { throwCustomError } from '@/lib/validation/throwCustomError';
import { loginValidationSchema } from '@/lib/validation/validation';
import type { GraphQLContext } from '../../../../../types/graphql/context';
import type { LoginUserArgs } from '../../../../../types/user';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

export const loginUser = async (
  _parent: unknown,
  { userLoginInput }: LoginUserArgs,
  { prisma }: GraphQLContext,
) => {
  const { email, password } = userLoginInput;

  // Validate input
  const validation = loginValidationSchema.safeParse(userLoginInput);
  if (!validation.success) {
    throwCustomError('Invalid input data', ErrorTypes.VALIDATION_ERROR, {
      zodIssues: validation.error.issues,
    });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    return throwCustomError(
      'Invalid email address or password',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throwCustomError(
      'Invalid email address or password',
      ErrorTypes.UNAUTHORIZED,
    );
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

  // Return AuthPayload
  return {
    token,
    userId: user.id,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      locale: user.locale,
      role: user.role,
      recipes: [],
      favoriteRecipes: [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};
