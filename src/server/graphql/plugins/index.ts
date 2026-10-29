import { allowlistPlugin } from './allowlist';
import { fieldAuthPlugin } from './fieldAuth';
import { loggingPlugin } from './logging';
import { rateLimitPlugin } from './rateLimit';
import { rootFieldAuthPlugin } from './rootFieldAuth';

export {
  allowlistPlugin,
  assertAllowedDocument,
  isAllowlistEnforced,
} from './allowlist';
export { fieldAuthPlugin } from './fieldAuth';
export { loggingPlugin } from './logging';
export { enforceOperationRateLimits, rateLimitPlugin } from './rateLimit';
export {
  assertGraphQLRootFieldsAuthorized,
  collectRootFields,
  rootFieldAuthPlugin,
} from './rootFieldAuth';

export const graphqlPlugins = [
  loggingPlugin,
  allowlistPlugin,
  rootFieldAuthPlugin,
  rateLimitPlugin,
  fieldAuthPlugin,
];
