import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import type { IContext } from '@/lib/graphql/types/context';

interface UserRegisterInput {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  locale?: string;
}

interface CreateUserArgs {
  userRegisterInput: UserRegisterInput;
}

export const createUser = async (
  _parent: unknown,
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

  // Validáció: jelszavak egyezése
  if (password !== confirmPassword) {
    throw new GraphQLError('A jelszavak nem egyeznek', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  // Validáció: jelszó erőssége
  if (password.length < 8) {
    throw new GraphQLError(
      'A jelszónak legalább 8 karakter hosszúnak kell lennie',
      {
        extensions: { code: 'BAD_USER_INPUT' },
      },
    );
  }

  // Email formátum validáció
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new GraphQLError('Érvénytelen email formátum', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  // Ellenőrizzük, hogy létezik-e már a username vagy email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userName }, { email }],
    },
  });

  if (existingUser) {
    if (existingUser.userName === userName) {
      throw new GraphQLError('Ez a felhasználónév már foglalt', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    if (existingUser.email === email) {
      throw new GraphQLError('Ez az email cím már regisztrálva van', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
  }

  // Jelszó hashelése
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // User létrehozása
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      locale: locale || 'en',
      role: 'USER',
    },
  });

  // Ne adjuk vissza a jelszót
  return {
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
  };
};
