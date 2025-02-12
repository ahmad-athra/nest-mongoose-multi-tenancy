import {
  DynamicModule,
  Global,
  Logger,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import {
  CONNECTION_MODE,
  MultiTenantModuleAsyncOptions,
  MultiTenantModuleOptions,
} from '../interfaces';
import {
  PojoModule,
  PojoModuleAsyncOptions,
} from './core-modules/pojo/pojo.module';
import { UseDBModule } from './core-modules/usedb/usedb.module';
import { createMongooseProviders } from './multi-tenant-mongoose.providers';

@Module({})
export class MongooseMultiTenantModule {
  private static logger = new Logger('MongooseMultiTenantModule');

  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    if (options.mode === CONNECTION_MODE.default) {
      const { uri, mongooseModuleOptions } = options;
      return {
        module: MongooseMultiTenantModule,
        imports: [MongooseModule.forRoot(uri, mongooseModuleOptions)],
        exports: [MongooseModule],
      };
    }
    if (options.mode === CONNECTION_MODE.use_db) {
      return {
        module: MongooseMultiTenantModule,
        imports: [UseDBModule.forRoot(options)],
        exports: [UseDBModule.forRoot(options)],
      };
    }
    if (options.mode === CONNECTION_MODE.pojo) {
      return {
        module: MongooseMultiTenantModule,
        imports: [PojoModule.forRoot(options)],
      };
    }

    this.logger.error('NOT PROVIDED', this);
    throw new Error('NOT PROVIDED');
  }

  static forRootAsync(options: MultiTenantModuleAsyncOptions): DynamicModule {
    if (options.mode === CONNECTION_MODE.default) {
      // const { uri, mongooseModuleOptions } = options;
      return {
        module: MongooseMultiTenantModule,
        imports: [
          MongooseModule.forRootAsync(options),
          // MongooseModule.forRootAsync({
          //   connectionName: '',
          //   imports: [],
          //   inject: [],
          //   useClass: undefined,
          //   useExisting: undefined,
          //   useFactory: undefined,
          // })
        ],
        exports: [MongooseModule],
      };
    }
    // if (options.mode === CONNECTION_MODE.use_db) {
    //   return {
    //     module: MongooseMultiTenantModule,
    //     imports: [UseDBModule.forRoot(options)],
    //     exports: [UseDBModule.forRoot(options)],
    //   };
    // }
    if (options.mode === CONNECTION_MODE.pojo) {
      return {
        module: MongooseMultiTenantModule,
        imports: [PojoModule.forRootAsync(options)],
      };
    }

    this.logger.error('NOT PROVIDED', this);
    throw new Error('NOT PROVIDED');
    return {
      module: MongooseMultiTenantModule,
      imports: [PojoModule.forRootAsync(options)],
    };
  }

  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers: Provider[] = createMongooseProviders(
      connectionName,
      models,
    );

    return {
      module: MongooseMultiTenantModule,
      // imports: [PojoModule],
      providers: providers,
      exports: providers,
    };
  }
}
