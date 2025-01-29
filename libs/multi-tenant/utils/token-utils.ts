import {
  DEFAULT_REQUEST_TENANT_KEY,
  DEFAULT_TENANT_KEY,
} from '../constants/providers.constants';

export function getTenantKey(tenantKey: string | undefined): string {
  return tenantKey?.trim().length ? tenantKey : DEFAULT_TENANT_KEY;
}

export function getRequestKey(tenantKey: string | undefined): string {
  return tenantKey?.trim().length ? tenantKey : DEFAULT_REQUEST_TENANT_KEY;
}
