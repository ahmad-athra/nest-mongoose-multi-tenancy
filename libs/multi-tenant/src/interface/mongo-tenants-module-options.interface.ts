import { ModuleMetadata } from '@nestjs/common';
import { ModelDefinition, MongooseModuleOptions } from '@nestjs/mongoose';
import { CONNECTION_APPROACH } from '../../constants/general.constants';
import { ConnectOptions } from 'mongoose';

export interface MongoTenantsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionToken?: string;
  useFactory?: (
    ...args: any[]
  ) => Promise<MongoTenantsModuleOptions> | MongoTenantsModuleOptions;
  inject?: any[];
}

export interface MongoTenantsModelsAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<ModelDefinition, 'name' | 'collection' | 'discriminators'> {
  useFactory?: (
    ...args: any[]
  ) => ModelDefinition['schema'] | Promise<ModelDefinition['schema']>;
  inject?: any[];
}

// -------------------------------------------------- EDITES
export interface MongoTenantsModuleOptionsPOJO {
  approach: CONNECTION_APPROACH.POJO;
  uri: string; // Required if approach is 'POJO'
  connectionOptions?: ConnectOptions;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;
}

export interface MongoTenantsModuleOptionsUSE_DB {
  approach: CONNECTION_APPROACH.USEDB;
  connectionToken?: string;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;
}

export type MongoTenantsModuleOptions =
  | MongoTenantsModuleOptionsPOJO
  | MongoTenantsModuleOptionsUSE_DB;

// ----------------------------------------------  new Works

export interface MultiTenantModuleOptions {
  approach: CONNECTION_APPROACH;
  uri: string;
  connectionToken?: string;
  connectionOptions?: ConnectOptions;
  mongooseModuleOptions?: MongooseModuleOptions;
  tenantKey?: string;
  requestKey?: string;
  debug?: boolean;
}
export interface MultiTenantModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionToken?: string;
  useFactory?: (
    ...args: any[]
  ) => Promise<MultiTenantModuleOptions> | MultiTenantModuleOptions;
  inject?: any[];
}
