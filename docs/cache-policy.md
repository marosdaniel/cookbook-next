# Cache Policy

The application uses explicit cache boundaries by route family:

| Route family | Policy | Reason |
| --- | --- | --- |
| Public HTML pages | Request-dynamic while locale is cookie-backed | The active locale is request-specific. |
| Authenticated `/me` pages | Request-dynamic, no shared cache | Responses contain user-specific data. |
| GraphQL | `force-dynamic`, `revalidate = 0`, `Cache-Control: no-store` | Queries can contain private data even when the operation is a read. |
| Sitemap | Static generation with `revalidate = 3600` | Public metadata changes hourly, not per request. |
| Robots | Static metadata response | It contains no request-specific data. |

This policy must be updated together with route-level `dynamic`, `revalidate`,
or response-header changes. Personalized responses must not become publicly
cacheable through an intermediary.