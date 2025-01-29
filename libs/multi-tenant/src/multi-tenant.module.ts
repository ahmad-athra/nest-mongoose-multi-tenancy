import { DynamicModule, Module } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import {
  MongoTenantsModelsAsyncOptions,
  MongoTenantsModuleAsyncOptions,
  MongoTenantsModuleOptions,
  MultiTenantModuleAsyncOptions,
  MultiTenantModuleOptions,
} from './interface/mongo-tenants-module-options.interface';
import { MultiTenantCoreModule } from './multi-tenant-core.module';

@Module({})
export class MultiTenantModule {
  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    return {
      module: MultiTenantModule,
      imports: [MultiTenantCoreModule.forRoot(options)],
      exports: [MultiTenantCoreModule],
    };
  }
  // static forRootAsync(options: MultiTenantModuleAsyncOptions): DynamicModule {
  //   return {
  //     module: MultiTenantModule,
  //     imports: [MultiTenantCoreModule.forRootAsync(options)]
  //   }
  // }

  static forFeature(models: ModelDefinition[] = []): DynamicModule {
    return {
      module: MultiTenantModule,
      imports: [MultiTenantCoreModule.forFeature(models)],
      exports: [MultiTenantCoreModule],
    };
  }

  // static forFeatureAsync(models: MongoTenantsModelsAsyncOptions[] = []): DynamicModule{
  //   return {
  //     module: MultiTenantModule,
  //     imports: [MultiTenantCoreModule.forFeatureAsync(models)]
  //   }
  // }
}
