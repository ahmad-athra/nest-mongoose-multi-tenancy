import { ModuleMetadata } from '@nestjs/common';
import { MultiTenantModuleOptions } from './multi-tenant-options.interface';

export interface PojoModuleOptions
  extends Pick<
    MultiTenantModuleOptions,
    'uri' | 'mongooseModuleOptions' | 'clearInterval'
  > {}

export interface PojoModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  clearInterval?: number;
  // TODO: implement [ useExisting?, useClass?, useFactory? ]
  useFactory: (
    ...args: any[]
    // ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  ) => Promise<PojoModuleFactoryOptions> | PojoModuleFactoryOptions;
  inject?: any[];
}

export type PojoModuleFactoryOptions = Pick<
  PojoModuleOptions,
  'uri' | 'mongooseModuleOptions'
>;
