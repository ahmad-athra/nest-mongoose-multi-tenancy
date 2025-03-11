import { ModuleMetadata, Type } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Observable } from 'rxjs';

export enum CONNECTION_MODE {
  // TODO: ADD OTHER CONNECTION MODES
  // default = 'default',
  // use_db = 'use_db',
  pojo = 'pojo',
}

// [Clear]
export interface MultiTenantModuleOptions {
  mode: CONNECTION_MODE;
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
  tenantValidator?: Type<ITenantValidator>;
  tenantKey?: string;
  requestKey?: string;
  clearInterval?: number;
  // debug?: boolean;
}
export interface MultiTenantModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  mode: CONNECTION_MODE;
  tenantValidator?: Type<ITenantValidator>;
  clearInterval?: number;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;

  connectionName?: string;
  // TODO: implement them
  // useExisting?: Type<MongooseOptionsFactory>;
  // useClass?: Type<MongooseOptionsFactory>;
  // TODO make useFactory Optional
  useFactory: (
    ...args: any[]
    // ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  ) =>
    | Promise<MultiTenantModuleFactoryOptions>
    | MultiTenantModuleFactoryOptions;
  inject?: any[];
}

export type MultiTenantModuleFactoryOptions = Pick<
  MultiTenantModuleOptions,
  'uri' | 'mongooseModuleOptions'
>;

export interface ITenantValidator {
  validate(tenantId: string): boolean | Promise<boolean> | Observable<boolean>;
}
