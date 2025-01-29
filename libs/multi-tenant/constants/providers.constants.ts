export const TENANT_KEY_TOKEN = 'TENANT_KEY';
/**
 * the name of `header` contains the tenant name
 * @default x-tenant-id
 */
export const DEFAULT_TENANT_KEY = 'x-tenant-id';

export const REQUEST_TENANT_KEY_TOKEN = 'REQUEST_TENANT_KEY';
/**
 * the name of variable carry the tenant name, `request[key]`
 * @default tenant_id
 */
export const DEFAULT_REQUEST_TENANT_KEY = 'tenant_id';

export const TENANT_CONNECTION_TOKEN = 'TENANT_CONNECTION';

/**
 * Tenant Options Token when pass it using `DI`
 */
export const MONGO_TENANT_ASYNC_MODULE_OPTIONS =
  'MONGO_TENANT_ASYNC_MODULE_OPTIONS';
export const MONGO_TENANT_MODELS_OPTIONS = 'MONGO_TENANT_MODELS_OPTIONS';
