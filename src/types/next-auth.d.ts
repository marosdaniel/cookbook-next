import type { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userName: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      locale: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    locale: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    locale: string;
  }
}
