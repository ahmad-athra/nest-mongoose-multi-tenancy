import { DynamicModule, Module } from '@nestjs/common';
import { MongooseMultiTenantService } from './mongoose-multi-tenant.service';
import { MultiTenantModuleOptions } from '../interfaces';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongooseMultiTenantModule {
  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    let module: DynamicModule = {
      module: MongooseMultiTenantModule,
    };
    if (options.approach === 'DEFAULT') {
      module = {
        ...module,
        imports: [
          MongooseModule.forRoot(options.uri, options.mongooseModuleOptions),
        ],
        exports: [MongooseModule],
      };
    }

    return module;
  }

  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    let module: DynamicModule = {
      module: MongooseMultiTenantModule,
      global: true,
      imports: [MongooseModule.forFeature(models, connectionName)],
      exports: [MongooseModule],
    };

    return module;
  }
}
