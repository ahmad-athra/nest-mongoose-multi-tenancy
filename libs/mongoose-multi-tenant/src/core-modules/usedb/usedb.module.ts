import {
  BadRequestException,
  DynamicModule,
  Logger,
  Module,
  ModuleMetadata,
  Provider,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import {
  getConnectionToken,
  MongooseModule,
  MongooseModuleOptions,
} from '@nestjs/mongoose';
import { Request } from 'express';
import {
  DEFAULT_TENANT_KEY,
  MONGOOSE_MULTI_TENANT_CONNECTION_NAME,
  MULTI_TENANT_CONNECTION_NAME,
  MULTI_TENANT_OPTIONS,
  REQUEST_TENANT_KEY_TOKEN,
} from 'libs/mongoose-multi-tenant/constants/multi-tenant.constants';
import { Connection } from 'mongoose';

// TODO move it to interfaces file
export interface UseDBModuleOptions {
  // approach: CONNECTION_APPROACH;
  //   mode: CONNECTION_MODE;
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
  //   tenantKey?: string;
  //   requestKey?: string;
  //   debug?: boolean;
}

export interface UseDBModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  // TODO: implement them
  // useExisting?: Type<MongooseOptionsFactory>;
  // useClass?: Type<MongooseOptionsFactory>;
  // TODO make useFactory Optional
  useFactory: (
    ...args: any[]
    // ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  ) => Promise<UseDBModuleOptions> | UseDBModuleOptions;
  inject?: any[];
}

@Module({})
export class UseDBModule {
  private static logger = new Logger(UseDBModule.name);

  static forRoot(options: UseDBModuleOptions): DynamicModule {
    const { uri, mongooseModuleOptions } = options;
    const { connectionName } = mongooseModuleOptions || {};
    const mongooseConnectionName = getConnectionToken(connectionName);
    const multiTenantConnectionName = '';
    // getMultiTenantConnectionToken(connectionName);

    const Providers = [
      {
        provide: REQUEST_TENANT_KEY_TOKEN,
        useValue: DEFAULT_TENANT_KEY,
      },
      // TODO: Function
      {
        provide: MONGOOSE_MULTI_TENANT_CONNECTION_NAME, // Constants
        scope: Scope.REQUEST,
        useFactory: (
          request: Request,
          tenantKey: string,
          connection: Connection,
        ) => {
          const db = request.headers[tenantKey]?.toString();
          if (!db) throw new Error(`Bad Request, missing ${tenantKey}`);
          const newConnection = connection.useDb(db, { useCache: true });
          this.logger.debug('', {
            connection_id: newConnection.id,
            connection_db: newConnection.db,
          });
          return newConnection;
        },
        inject: [
          REQUEST,
          REQUEST_TENANT_KEY_TOKEN,
          getConnectionToken(connectionName),
        ],
      },
    ];
    return {
      module: UseDBModule,
      global: true,
      imports: [MongooseModule.forRoot(uri, mongooseModuleOptions)],
      exports: [MongooseModule, ...Providers],
      providers: Providers,
    };
  }
  static forRootAsync(options: UseDBModuleAsyncOptions): DynamicModule {
    const { connectionName } = options;
    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider = {
      provide: MULTI_TENANT_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };
    const multiTenantConnectionOptionsProvider = {
      provide: MULTI_TENANT_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      scope: Scope.REQUEST,
      provide: mongooseConnectionName,
      useFactory: (
        request: Request,
        options: UseDBModuleAsyncOptions,
        connection: Connection,
      ) => {
        const db = request.headers['x-tenant-id']?.toString();
        if (!db)
          throw new BadRequestException(`Missing x-tenant-id ${db} in headers`);
        const newConnection = connection.useDb(db, { useCache: true });

        // const connection_db = `${mongooseConnectionName}-${db}`; //unique name for every connection // based on connection name and tenant-id
        // console.log(`mongooseConnectionName, ${mongooseConnectionName}`);
        return newConnection;
      },
      inject: [
        REQUEST,
        MULTI_TENANT_OPTIONS,
        getConnectionToken(connectionName),
      ],
    };

    const Providers = [
      // {
      //   provide: REQUEST_TENANT_KEY_TOKEN,
      //   useValue: DEFAULT_TENANT_KEY,
      // },
      mongooseConnectionNameProvider,
      multiTenantConnectionOptionsProvider,
      // TODO: Function
      {
        provide: MONGOOSE_MULTI_TENANT_CONNECTION_NAME, // Constants
        scope: Scope.REQUEST,
        useFactory: (
          request: Request,
          tenantKey: string,
          connection: Connection,
        ) => {
          const db = request.headers[tenantKey]?.toString();
          if (!db) throw new Error(`Bad Request, missing ${tenantKey}`);
          const newConnection = connection.useDb(db, { useCache: true });
          this.logger.debug('', {
            connection_id: newConnection.id,
            connection_db: newConnection.db,
          });
          return newConnection;
        },
        inject: [
          REQUEST,
          REQUEST_TENANT_KEY_TOKEN,
          getConnectionToken(connectionName),
        ],
      },
    ];
    return {
      module: UseDBModule,
      global: true,
      // imports: [MongooseModule.forRoot(uri, mongooseModuleOptions)],
      exports: [MongooseModule, ...Providers],
      providers: Providers,
    };
  }
}
