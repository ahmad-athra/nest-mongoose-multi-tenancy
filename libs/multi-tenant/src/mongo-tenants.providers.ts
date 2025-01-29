import { Provider } from '@nestjs/common';
import { getRequestKey, getTenantKey } from '../utils/token-utils';
import {
  DEFAULT_REQUEST_TENANT_KEY,
  DEFAULT_TENANT_KEY,
  MONGO_TENANT_ASYNC_MODULE_OPTIONS,
  REQUEST_TENANT_KEY_TOKEN,
  TENANT_KEY_TOKEN,
} from '../constants/providers.constants';
import {
  MongoTenantsModuleAsyncOptions,
  MongoTenantsModuleOptions,
} from './interface/mongo-tenants-module-options.interface';

/**
 * @description provider register the name of header source contain tenant name
 * @param {string} tenantKey - the name of header source contain tenant name - @default 'x-tenant-id'
 * @returns Provider
 */
// TODO no need to middleware since we can extract it in request any where
export function createMiddlewareTenantKey(
  tenantKey: string | undefined,
): Provider {
  const tenant_key = getTenantKey(tenantKey);
  if (tenant_key !== DEFAULT_TENANT_KEY)
    console.warn(
      `TENANT_KEY FOR [MongoTenantsMiddleware] CHANGED FROM \`x-tenant-id\` to \`${tenant_key}\` `,
    );
  return {
    provide: TENANT_KEY_TOKEN,
    useValue: tenant_key,
  };
}

export function createAsyncMiddlewareTenantKey(): Provider {
  return {
    provide: TENANT_KEY_TOKEN,
    useFactory: (options: MongoTenantsModuleOptions) => {
      const tenant_key = getTenantKey(options.tenantKey);
      if (tenant_key !== DEFAULT_TENANT_KEY)
        console.warn(
          `TENANT_KEY FOR [MongoTenantsMiddleware] CHANGED FROM \`db\` to \`${tenant_key}\` `,
        );
      return getTenantKey(options.tenantKey);
    },
    inject: [MONGO_TENANT_ASYNC_MODULE_OPTIONS],
  };
}

/**
 * @description provider register the name of field inside request contain tenant name
 * @param {string} requestKey - the name of field inside request contain tenant name - @default 'tenant_id'
 * @returns Provider
 */
// TODO Take type from [MultiTenantModuleOptions] interface
export function createRequestTenantKey(
  requestKey: string | undefined,
): Provider {
  const request_key = getRequestKey(requestKey);
  if (request_key !== DEFAULT_REQUEST_TENANT_KEY)
    console.warn(
      `TENANT_KEY INSIDE [REQUEST] FOR [NixMongoTenantModule] CHANGED FROM \`tenant_id\` to \`${request_key}\` `,
    );
  return {
    provide: REQUEST_TENANT_KEY_TOKEN,
    useValue: request_key,
  };
}

// export function createAsyncRequestTenantKey (): Provider {
//     return {
//         provide: REQUEST_TENANT_KEY_TOKEN,
//         useFactory: (options: MongoTenantsModuleOptions) => {
//             const request_key = getRequestKey(options.requestKey);
//             if (request_key !== DEFAULT_REQUEST_TENANT_KEY)
//                 console.warn(`TENANT_KEY INSIDE [REQUEST] FOR [NixMongoTenantModule] CHANGED FROM \`db\` to \`${request_key}\` `)
//             return getRequestKey(options.requestKey)
//         },
//         inject: [MONGO_TENANT_ASYNC_MODULE_OPTIONS],
//       }
// }

// export function createAsyncOptionsModuleProvider(options: MongoTenantsModuleAsyncOptions): Provider {
//     if (options.useFactory) {
//         return {
//             provide: MONGO_TENANT_ASYNC_MODULE_OPTIONS,
//             useFactory: options.useFactory,
//             inject: options.inject || [],
//         }

//     }
// }
