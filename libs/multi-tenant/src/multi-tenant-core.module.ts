import {
  DynamicModule,
  flatten,
  Global,
  Inject,
  Logger,
  Module,
  ModuleMetadata,
  NotFoundException,
  OnApplicationShutdown,
  OnModuleDestroy,
  Provider,
  Scope,
} from '@nestjs/common';
import { ModuleRef, REQUEST } from '@nestjs/core';
import {
  getConnectionToken,
  getModelToken,
  ModelDefinition,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection, Document, Model } from 'mongoose';
import { CONNECTION_APPROACH } from '../constants/general.constants';
import {
  MONGO_TENANT_ASYNC_MODULE_OPTIONS,
  TENANT_CONNECTION_TOKEN,
} from '../constants/providers.constants';
import {
  getMultiTenantConnectionToken,
  getRequestKey,
} from '../utils/token-utils';
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
import { log } from 'console';
import {
  extractMongooseOptions,
  handlePojoApproach,
  handleUseDbApproach,
} from '../common/multi-tenant.utils';

@Module({})
export class MultiTenantCoreModule implements OnModuleDestroy {
  onModuleDestroy() {
    this.loggerX.log('onModuleDestroy down...', MultiTenantCoreModule.name);
  }
  private static logger: Logger = new Logger(MultiTenantCoreModule.name);
  private loggerX: Logger = new Logger(MultiTenantCoreModule.name);

  static forRootCommon(
    providers: ModuleMetadata['providers'],
    imports: ModuleMetadata['imports'] = [],
  ): DynamicModule {
    return {
      module: MultiTenantCoreModule,
      // TODO
      global: true, // check it
      imports: imports,
      providers,
      exports: providers,
    };
  }
  // [OK]
  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    const mongooseOptions = extractMongooseOptions(
      options.mongooseModuleOptions,
    );

    // import MongooseModule to make its providers available
    const mongooseModuleImport = MongooseModule.forRoot(
      options.uri,
      options.mongooseModuleOptions,
    );

    const providers = [
      // this.createMultiTenantConnectionNameProvider(options),
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

  // private static createMultiTenantConnectionNameProvider(
  //   options: MultiTenantModuleOptions,
  // ): Provider {
  //   const mongooseConnectionName = getConnectionToken(
  //     options.mongooseModuleOptions?.connectionName,
  //   );

  //   const multiTenantMongooseConnectionName = getMultiTenantConnectionToken(
  //     mongooseConnectionName,
  //   );
  //   return {
  //     provide: TENANT_CONNECTION_TOKEN,
  //     useValue: multiTenantMongooseConnectionName,
  //   };
  // }
  // [CLEAN]
  /**
   *
   * @param options
   * @returns Provider
   */
  private static createTenantConnectionProvider(
    options: MultiTenantModuleOptions,
  ): Provider {
    const mongooseConnectionName = getConnectionToken(
      options.mongooseModuleOptions?.connectionName,
    );

    this.logger.log(`Mongoose Connection Name: ${mongooseConnectionName}`);
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
    } else if (options.approach === CONNECTION_APPROACH.USEDB) {
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
        inject: [REQUEST, mongooseConnectionName],
      };
    } else {
      return {
        provide: TENANT_CONNECTION_TOKEN,
        useFactory: (connection: Connection) => connection,
        inject: [mongooseConnectionName],
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
  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    const modelsProviders = this.createTenantModelProvider(
      models,
      connectionName,
    );
    return {
      module: MultiTenantCoreModule,
      global: true,
      imports: [MongooseModule],
      providers: [...modelsProviders],
      exports: [...modelsProviders],
    };
  }

  // TODO: Add discriminators Support
  // DOING: implement discriminators Support
  private static createTenantModelProvider(
    models: ModelDefinition[],
    connectionName?: string,
  ): Provider[] {
    const providers = models.reduce(
      (providers, model) => [
        ...providers,
        // TODO: Separate it in utils function
        ...(model.discriminators || []).map((d) => ({
          provide: getModelToken(d.name, connectionName),
          useFactory: (model: Model<Document>) =>
            model.discriminator(d.name, d.schema, d.value),
          inject: [getModelToken(model.name, connectionName)],
        })),
        {
          // TODO: Make durable according to the used approach
          scope: Scope.REQUEST,
          durable: true,
          provide: getModelToken(model.name, connectionName),
          useFactory: (tenantConnection: Connection) => {
            console.log('tenantConnection.id', tenantConnection.id);
            return tenantConnection.models[model.name]
              ? tenantConnection.models[model.name]
              : tenantConnection.model(
                  model.name,
                  model.schema,
                  model.collection,
                );
          },
          // TODO: replace it with TENANT_CONNECTION_TOKEN
          // inject: [getConnectionToken(connectionName)],
          inject: [TENANT_CONNECTION_TOKEN],
        } as Provider,
      ],
      [] as Provider[],
    );
    return providers;

    // return models.map((model) => ({
    //   provide: getModelToken(model.name),
    //   useFactory: (tenantConnection: Connection) =>
    //     tenantConnection.models[model.name]
    //       ? tenantConnection.models[model.name]
    //       : tenantConnection.model(model.name, model.schema, model.collection),
    //   inject: [TENANT_CONNECTION_TOKEN],
    // }));
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
