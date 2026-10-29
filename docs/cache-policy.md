# Cache Policy

The application uses explicit cache boundaries by route family:

| Route family              | Policy                                                       | Reason                                                              |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Public HTML pages         | Request-dynamic while locale is cookie-backed                | The active locale is request-specific.                              |
| Authenticated `/me` pages | Request-dynamic, no shared cache                             | Responses contain user-specific data.                               |
| GraphQL                   | `force-dynamic`, `revalidate = 0`, `Cache-Control: no-store` | Queries can contain private data even when the operation is a read. |
| Sitemap                   | Static generation with `revalidate = 3600`                   | Public metadata changes hourly, not per request.                    |
| Robots                    | Static metadata response                                     | It contains no request-specific data.                               |

This policy must be updated together with route-level `dynamic`, `revalidate`,
or response-header changes. Personalized responses must not become publicly
cacheable through an intermediary.

---

## Server-Side Redis Cache (`src/server/platform/cache.ts`)

Application-level Redis caching is managed centrally through `cached()` and `invalidateCacheScope()` in [`src/server/platform/cache.ts`](../src/server/platform/cache.ts), using key builders from [`src/lib/cache/cacheKeys.ts`](../src/lib/cache/cacheKeys.ts):

- **Single-flight deduplication**: Concurrent cache misses on the same key within a server instance share a single in-flight `load()` promise.
- **Date rehydration**: ISO-8601 date strings (`createdAt`, `updatedAt`, `followedAt`, `resetPasswordExpires`) returned from Upstash JSON deserialization are automatically converted back into `Date` instances so cached and fresh payloads have identical runtime types.
- **Circuit breaker resilience**: Redis operations are wrapped with a `cockatiel` circuit breaker (`REDIS_BREAKER_THRESHOLD`, default 3 consecutive failures, 5s cool-down) and a 1000ms aggressive timeout, falling back to PostgreSQL when Redis is unavailable.
- **Session version cache (`session:v:{userId}`)**: Cached for 60 seconds (`SESSION_VERSION_CACHE_TTL_SECONDS = 60`) in the NextAuth `jwt` callback and immediately invalidated on password change, password reset, or user deletion (maximum revocation propagation delay is 60s if Redis invalidation fails).
- **Centralized invalidation (`invalidateCacheScope`)**: Mutations invalidate `recipe:{id}`, `recipe:lookup:{id}`, `recipe:lookup:{slug}`, `recipes:user:{authorId}:all`, `user:{id}:favorites:all`, `user:{id}:following:all`, and bump `recipes:list:version` in one place.
