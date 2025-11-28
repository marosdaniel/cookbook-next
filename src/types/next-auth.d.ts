import type { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    maxAge?: number;
    user: {
      id: string;
      userName: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      locale: string;
      rememberMe?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    locale: string;
    rememberMe?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    locale?: string;
    rememberMe?: boolean;
    maxAge?: number;
  }
}
