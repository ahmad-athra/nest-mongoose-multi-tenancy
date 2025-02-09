import { DynamicModule, Logger, Module, Scope } from '@nestjs/common';
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
}
