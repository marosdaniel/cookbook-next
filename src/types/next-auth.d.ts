import type { DefaultSession } from 'next-auth';
import type { SessionUser } from './user';

declare module 'next-auth' {
  interface Session {
    maxAge?: number;
    user: SessionUser & DefaultSession['user'];
  }

  interface User extends SessionUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    role?: import('@prisma/client').UserRole;
    locale?: string;
    rememberMe?: boolean;
    maxAge?: number;
  }
}
