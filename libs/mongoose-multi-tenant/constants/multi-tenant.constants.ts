// Default values

/**
 * the name of `header` property contains the tenant name
 * @default x-tenant-id
 */
export const DEFAULT_TENANT_KEY = 'x-tenant-id';

/**
 * the name of variable carry the tenant name, `request[key]`
 * @default tenant_id
 */
export const DEFAULT_REQUEST_TENANT_KEY = 'tenant_id';
export const DEFAULT_DB_CONNECTION = 'MultiTenantDatabaseConnection';

// ------------------------------------------------------
// Tokens
export const TENANT_VALIDATOR_TOKEN = 'TENANT_VALIDATOR_TOKEN';
export const TENANT_KEY_TOKEN = 'TENANT_KEY_TOKEN';
export const REQUEST_TENANT_KEY_TOKEN = 'REQUEST_TENANT_KEY_TOKEN';
export const MULTI_TENANT_CONNECTION = 'multi-tenant-connection';
export const MULTI_TENANT_CONNECTION_NAME = 'multi-tenant-connection-name';
export const MULTI_TENANT_OPTIONS = 'MongooseMultiTenantOptions';

export const MONGOOSE_MULTI_TENANT_CONNECTION_NAME =
  'MongooseMultiTenantConnectionName';
