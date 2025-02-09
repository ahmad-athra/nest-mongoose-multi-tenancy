import {
  DEFAULT_DB_CONNECTION,
  DEFAULT_REQUEST_TENANT_KEY,
  DEFAULT_TENANT_KEY,
} from '../constants/multi-tenant.constants';
import { MultiTenantModuleOptions } from '../interfaces';

export function getTenantKey(tenantKey?: string): string {
  return tenantKey?.trim().length ? tenantKey : DEFAULT_TENANT_KEY;
}

export function getRequestKey(tenantKey?: string): string {
  return tenantKey?.trim().length ? tenantKey : DEFAULT_REQUEST_TENANT_KEY;
}

// --------------------------- [Multi Tenant Utils]
export function getModelToken(model: string, connectionName?: string) {
  if (connectionName === undefined) {
    return `${model}Model`;
  }
  return `${getConnectionToken(connectionName)}/${model}Model`;
}

export function getConnectionToken(name?: string) {
  return name && name !== DEFAULT_DB_CONNECTION
    ? `MultiTenant${name}Connection`
    : DEFAULT_DB_CONNECTION;
}

// ------------------------------------
export function extractMongooseOptions(
  options: MultiTenantModuleOptions['mongooseModuleOptions'] = {},
) {
  const {
    connectionName,
    uri,
    retryAttempts,
    retryDelay,
    connectionFactory,
    connectionErrorFactory,
    lazyConnection,
    onConnectionCreate,
    verboseRetryLog,
    ...mongooseOptions
  } = options;
  return mongooseOptions;
}
