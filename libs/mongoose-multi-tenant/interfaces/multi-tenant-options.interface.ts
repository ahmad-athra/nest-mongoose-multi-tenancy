import { MongooseModuleOptions } from '@nestjs/mongoose';

export enum CONNECTION_APPROACH {
  DEFAULT = 'DEFAULT',
  POJO = 'POJO',
  USEDB = 'USEDB',
}

export interface MultiTenantModuleOptions {
  approach: CONNECTION_APPROACH;
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;
}
