import {
  DynamicModule,
  flatten,
  Logger,
  Module,
  NotFoundException,
  Provider,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  getConnectionToken,
  getModelToken,
  ModelDefinition,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CONNECTION_APPROACH } from '../constants/general.constants';
import {
  MONGO_TENANT_ASYNC_MODULE_OPTIONS,
  TENANT_CONNECTION_TOKEN,
} from '../constants/providers.constants';
import { getRequestKey } from '../utils/token-utils';
import { handlePojoApproach, handleUseDbApproach } from './helper';
import {
  MongoTenantsModelsAsyncOptions,
  MongoTenantsModuleAsyncOptions,
  MongoTenantsModuleOptions,
  MultiTenantModuleOptions,
} from './interface/mongo-tenants-module-options.interface';
import {
  createAsyncMiddlewareTenantKey,
  /*createAsyncOptionsModuleProvider, createAsyncRequestTenantKey, */ createMiddlewareTenantKey,
  createRequestTenantKey,
} from './mongo-tenants.providers';

@Module({})
export class MultiTenantCoreModule {
  private static logger: Logger = new Logger(MultiTenantCoreModule.name);

  static forRootCommon(providers: Provider[], imports?: any[]): DynamicModule {
    return {
      module: MultiTenantCoreModule,
      global: true,
      imports: imports || [],
      providers,
      exports: providers,
    };
  }
  // [OK]
  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    const mongooseModuleImport = MongooseModule.forRoot(
      options.uri,
      options.mongooseModuleOptions,
    );
    const providers = [
      createMiddlewareTenantKey(options.tenantKey),
      createRequestTenantKey(options.requestKey),
      this.createTenantConnectionProvider(options),
    ];
    // [mongooseModuleImport]
    return this.forRootCommon(providers, [mongooseModuleImport]);
  }

  // static forRootAsync(options: MongoTenantsModuleAsyncOptions): DynamicModule {
  //   const providers = [
  //     createAsyncMiddlewareTenantKey(),
  //     createAsyncRequestTenantKey(),
  //     createAsyncOptionsModuleProvider(options),
  //     this.createAsyncTenantConnectionProvider(options)

  //   ];
  //    return this.forRootCommon(providers, options.imports)
  // }

  // ---------------------------------------------------------------------- [METHODS]

  // [CLEAN]
  /**
   *
   * @param options
   * @returns Provider
   */
  private static createTenantConnectionProvider(
    options: MultiTenantModuleOptions,
  ): Provider {
    if (options.approach === CONNECTION_APPROACH.POJO) {
      return {
        provide: TENANT_CONNECTION_TOKEN,
        durable: true,
        scope: Scope.REQUEST,
        useFactory: (request: Request): Connection | Promise<Connection> => {
          // TODO check if able to get it from provider [REQUEST_TENANT_KEY_TOKEN]
          const requestKey = getRequestKey(options.requestKey);
          const db = request[requestKey];

          if (!db) {
            this.logger.error('Database name is missing in request');
            throw new NotFoundException('Database name is missing');
          }

          return handlePojoApproach(db, options);
        },
        inject: [REQUEST],
      };
    } else {
      const connectionToken = getConnectionToken(options.connectionToken);
      return {
        provide: TENANT_CONNECTION_TOKEN,
        durable: true,
        scope: Scope.REQUEST,
        useFactory: (
          request: Request,
          connection: Connection,
        ): Connection | Promise<Connection> => {
          // TODO check if able to get it from provider [REQUEST_TENANT_KEY_TOKEN]
          const requestKey = getRequestKey(options.requestKey);
          const db = request[requestKey];

          if (!db) {
            this.logger.error('Database name is missing in request');
            throw new NotFoundException('Database name is missing');
          }

          return handleUseDbApproach(db, connection);
        },
        inject: [REQUEST, connectionToken],
      };
    }
  }

  //   --------------------------------------------------- [ASYNC]

  // private static createAsyncTenantConnectionProvider(factoryOptions: MongoTenantsModuleAsyncOptions): Provider {
  //     return {
  //         provide: TENANT_CONNECTION_TOKEN,
  //         useFactory: (options: MongoTenantsModuleOptions, request: Request, connection: Connection) => {
  //             const requestKey = getRequestKey(options.requestKey)
  //             const db = request[requestKey];

  //             if (!db) {
  //               this.logger.error(`Database not found for request key: ${options.requestKey}`);
  //               throw new NotFoundException(`Database not found for request key: ${options.requestKey}`);
  //             }

  //             return options.approach === CONNECTION_APPROACH.POJO
  //             ? handlePojoApproach(this.connections, db, options)
  //             : handleUseDbApproach(db, connection);
  //         },
  //         inject: [MONGO_TENANT_ASYNC_MODULE_OPTIONS, REQUEST, factoryOptions.connectionToken]
  //     }
  // }

  // [OK]
  static forFeature(models: ModelDefinition[] = []): DynamicModule {
    const modelsProviders = this.createTenantModelProvider(models);
    return {
      module: MultiTenantCoreModule,
      // global: true,
      // imports: [MongooseModule],
      providers: [...modelsProviders],
      exports: [...modelsProviders],
    };
  }

  // [OK]
  private static createTenantModelProvider(
    models: ModelDefinition[],
  ): Provider[] {
    return models.map((model) => ({
      provide: getModelToken(model.name),
      useFactory: (tenantConnection: Connection) =>
        tenantConnection.models[model.name]
          ? tenantConnection.models[model.name]
          : tenantConnection.model(model.name, model.schema, model.collection),
      inject: [TENANT_CONNECTION_TOKEN],
    }));
  }

  // static forFeatureAsync(
  //   factories: MongoTenantsModelsAsyncOptions[]
  // ): DynamicModule {
  // const Providers = this.createTenantModelsAsyncProvider(factories);
  // const imports = factories.map(optionsFactory => optionsFactory.imports || []);
  // const uniqImports = new Set(flatten(imports));

  //   return {
  //     module: MultiTenantCoreModule,
  //     // global: true
  //     imports: [...uniqImports],
  //     providers: Providers,
  //     exports: Providers,
  //   }
  // }

  // private static createTenantModelsAsyncProvider (optionsFactories: MongoTenantsModelsAsyncOptions[]): Provider[] {
  //   return optionsFactories.reduce((providers, option) => {
  //     return [
  //       ...providers,
  //       {
  //         provide: getModelToken(option.name),
  //         useFactory: async (tenantConnection: Connection, ...args: unknown[]) => {
  //           const schema = await option.useFactory(...args);
  //           const model = tenantConnection.model(
  //             option.name,
  //             schema,
  //             option.collection
  //           )
  //           return model
  //         },
  //         inject: [TENANT_CONNECTION_TOKEN, ...(option.inject || [])]
  //       }
  //     ] as Provider[]
  //   }, [] as Provider[])
  // }
}
