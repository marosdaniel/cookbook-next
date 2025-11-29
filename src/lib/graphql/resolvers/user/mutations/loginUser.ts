import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type { LoginUserArgs } from '../../../../../types/api/user';
import type { GraphQLContext } from '../../../../../types/graphql/context';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

export const loginUser = async (
  _parent: unknown,
  { userLoginInput }: LoginUserArgs,
  { prisma }: GraphQLContext,
) => {
  const { email, password } = userLoginInput;

  // Keressük meg a usert email alapján
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new GraphQLError('Hibás email cím vagy jelszó', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  // Jelszó ellenőrzése
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new GraphQLError('Hibás email cím vagy jelszó', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  // JWT token generálása
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

  // AuthPayload visszaadása
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
