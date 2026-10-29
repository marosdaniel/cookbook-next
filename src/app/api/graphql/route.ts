import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getRateLimitClientKey } from '@/lib/rateLimit/clientIp';
import { rateLimiter } from '@/lib/rateLimit/rateLimit';
import { withTimeout } from '@/lib/redis/redis';
import { requestStorage, resolveSessionSafely } from '@/server/graphql/context';
import { graphqlNextHandler as handler } from '@/server/graphql/server';

const MAX_GRAPHQL_BODY_BYTES = 1_048_576;

export const maxDuration = 30;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type GraphQLRequestPayload = {
  operationName?: string;
  query?: string;
};

const createJsonResponse = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Vary: 'Cookie, Authorization',
      ...headers,
    },
  });
};

const parseRequestPayload = (requestBody: string): GraphQLRequestPayload => {
  return JSON.parse(requestBody);
};

const enforceGlobalRateLimit = async (
  clientKey: string,
): Promise<Response | null> => {
  const limiter = rateLimiter;
  if (!limiter) {
    return null;
  }

  try {
    const rateLimitResult = await withTimeout(
      () => limiter.limit(clientKey),
      750,
    );

    if (!rateLimitResult) {
      return null;
    }

    const { success, limit, remaining } = rateLimitResult;

    if (success) {
      return null;
    }

    return createJsonResponse({ error: 'Too many requests' }, 429, {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
    });
  } catch (error) {
    console.warn('GraphQL global rate limiter failed.', error);
    return null;
  }
};

const wrappedHandler = async (
  request: Request,
  _context?: { params?: Promise<Record<string, never>> },
): Promise<Response> => {
  if (request.method !== 'POST') {
    return createJsonResponse(
      {
        error: 'Method not allowed',
        message: 'GraphQL requests must use POST.',
      },
      405,
      { Allow: 'POST' },
    );
  }

  const session = await resolveSessionSafely();
  const requestId = request.headers.get('x-request-id') || randomUUID();
  const clientKey = getRateLimitClientKey(request);

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return createJsonResponse(
      {
        error: 'Unsupported media type',
        message: 'GraphQL POST requests must use application/json.',
      },
      415,
    );
  }

  const contentLength = request.headers.get('content-length');
  if (
    contentLength &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > MAX_GRAPHQL_BODY_BYTES
  ) {
    return createJsonResponse(
      { error: 'GraphQL request body is too large' },
      413,
    );
  }

  const requestBody = await request.text();
  if (
    new TextEncoder().encode(requestBody).byteLength > MAX_GRAPHQL_BODY_BYTES
  ) {
    return createJsonResponse(
      { error: 'GraphQL request body is too large' },
      413,
    );
  }

  if (!requestBody.trim()) {
    return createJsonResponse(
      {
        error: 'Empty request body',
        message: 'GraphQL POST requests must include a JSON body.',
      },
      400,
    );
  }

  try {
    parseRequestPayload(requestBody);
  } catch {
    return createJsonResponse(
      {
        error: 'Invalid JSON body',
        message: 'GraphQL POST requests must include valid JSON.',
      },
      400,
    );
  }

  const rateLimitResponse = await enforceGlobalRateLimit(clientKey);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const replayedRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: requestBody,
    duplex: 'half',
  });

  try {
    const response = await requestStorage.run(
      { session, requestId, clientKey },
      () => handler(replayedRequest),
    );

    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Vary', 'Cookie, Authorization');
    response.headers.set('X-Request-Id', requestId);

    return response;
  } catch (error) {
    console.error('Unhandled GraphQL route error:', error);
    return createJsonResponse(
      {
        errors: [
          {
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          },
        ],
      },
      500,
      { 'X-Request-Id': requestId },
    );
  }
};

// Export Next.js route handlers
export const POST = wrappedHandler;
export { wrappedHandler };
