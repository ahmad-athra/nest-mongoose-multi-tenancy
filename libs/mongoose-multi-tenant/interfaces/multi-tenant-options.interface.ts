import { ModuleMetadata } from '@nestjs/common';
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

export interface MultiTenantModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  mode: CONNECTION_MODE;
  // TODO: implement them
  // useExisting?: Type<MongooseOptionsFactory>;
  // useClass?: Type<MongooseOptionsFactory>;
  // TODO make useFactory Optional
  useFactory: (
    ...args: any[]
    // ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  ) => Promise<MultiTenantModuleOptions> | MultiTenantModuleOptions;
  inject?: any[];
}
