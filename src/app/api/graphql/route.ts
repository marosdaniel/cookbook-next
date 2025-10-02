import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import jwt from 'jsonwebtoken';
import {
  typeDefs,
  resolvers as scalarResolvers,
} from '../../../lib/graphql/schema';
import { resolvers } from '../../../lib/graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers: { ...scalarResolvers, ...resolvers },
});

type ContextUser = { _id?: string; role?: 'ADMIN' | 'USER' | 'BLOGGER' };

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    // Normalize header access across runtimes
    const hdr = (name: string): string => {
      const h = (req.headers as any)?.get
        ? (req.headers as any).get(name)
        : (req.headers as any)[name];
      return Array.isArray(h) ? h[0] : h || '';
    };
    const auth = hdr('authorization');
    let user: ContextUser | undefined;
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const payload = jwt.verify(
          token,
          process.env.NEXTAUTH_SECRET || 'secret'
        ) as any;
        user = {
          _id: payload.userId?.toString?.() ?? String(payload.userId),
          role: payload.role,
        };
      } catch {
        // ignore invalid token
      }
    }
    return user ?? {};
  },
});

export { handler as GET, handler as POST };
