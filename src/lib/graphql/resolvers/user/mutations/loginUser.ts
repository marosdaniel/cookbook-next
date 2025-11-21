import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type { IContext } from '@/lib/graphql/types/common';

interface UserLoginInput {
  userNameOrEmail: string;
  password: string;
}

interface LoginUserArgs {
  userLoginInput: UserLoginInput;
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

export const loginUser = async (
  _parent: unknown,
  { userLoginInput }: LoginUserArgs,
  { prisma }: IContext,
) => {
  const { userNameOrEmail, password } = userLoginInput;

  // Keressük meg a usert username vagy email alapján
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
    },
  });

  if (!user) {
    throw new GraphQLError('Hibás felhasználónév/email vagy jelszó', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  // Jelszó ellenőrzése
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new GraphQLError('Hibás felhasználónév/email vagy jelszó', {
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
