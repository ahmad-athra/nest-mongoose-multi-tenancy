import { MongooseModuleOptions } from '@nestjs/mongoose';

// export enum CONNECTION_APPROACH {
//   DEFAULT = 'DEFAULT',
//   POJO = 'POJO',
//   USEDB = 'USEDB',
// }
export enum CONNECTION_MODE {
  default = 'default',
  pojo = 'pojo',
  use_db = 'use_db',
}

export interface MultiTenantModuleOptions {
  // approach: CONNECTION_APPROACH;
  mode: CONNECTION_MODE;
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;
}
