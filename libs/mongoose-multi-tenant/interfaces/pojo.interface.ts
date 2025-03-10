import { ModuleMetadata } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface PojoModuleOptions {
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
  clearInterval?: number;
}

export interface PojoModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  clearInterval?: number;
  // TODO: implement them
  // useExisting?: Type<MongooseOptionsFactory>;
  // useClass?: Type<MongooseOptionsFactory>;
  // TODO make useFactory Optional
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
