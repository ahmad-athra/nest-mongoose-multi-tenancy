import {
  BadRequestException,
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Request } from 'express';
import {
  MULTI_TENANT_CONNECTION_NAME,
  MULTI_TENANT_OPTIONS,
} from 'libs/mongoose-multi-tenant/constants/multi-tenant.constants';
import {
  extractMongooseOptions,
  getConnectionToken,
} from 'libs/mongoose-multi-tenant/utils/token-utils';
import { Connection, createConnection } from 'mongoose';

export interface PojoModuleOptions {
  uri: string;
  mongooseModuleOptions?: MongooseModuleOptions;
}

@Global()
@Module({})
export class PojoModule implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string) {
    [...PojoModule.connections.values()].forEach(
      async (connection) => connection && (await connection.close()),
    );
  }
  static readonly connections: Map<string, Connection> = new Map();
  static forRoot(options: PojoModuleOptions): DynamicModule {
    const { uri, mongooseModuleOptions } = options;
    const { connectionName } = mongooseModuleOptions || {};

    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider = {
      provide: MULTI_TENANT_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };
    const multiTenantConnectionOptionsProvider = {
      provide: MULTI_TENANT_OPTIONS,
      useValue: options,
    };

    const connectionProvider = {
      scope: Scope.REQUEST,
      provide: mongooseConnectionName,
      useFactory: async (request: Request, options: PojoModuleOptions) => {
        const db = request.headers['x-tenant-id']?.toString();
        if (!db)
          throw new BadRequestException(`Missing x-tenant-id ${db} in headers`);

        console.log('this.connections.has(db)', this.connections.has(db));

        if (this.connections.has(db)) {
          const connection = this.connections.get(db) as Connection;
          if (connection.readyState !== 1) {
            this.connections.delete(db);
          } else {
            return this.connections.get(db);
          }
        }

        const mongooseOptions = extractMongooseOptions(
          options.mongooseModuleOptions,
        );
        const newConnection = await createConnection(uri, {
          ...mongooseOptions,
          dbName: db,
        }).asPromise();
        this.connections.set(db, newConnection);
        setTimeout(async () => {
          this.connections.delete(db);
          await newConnection.close();
          //   newConnection
          console.log(
            `clear ${db} from connections, connection_id: ${newConnection.id}`,
          );
        }, 10 * 1000);

        setInterval(() => {
          console.log(`Active connections: ${this.connections.size}`);
        }, 60 * 1000);
        return newConnection;
      },
      inject: [REQUEST, MULTI_TENANT_OPTIONS],
    };

    return {
      module: PojoModule,
      providers: [
        mongooseConnectionNameProvider,
        multiTenantConnectionOptionsProvider,
        connectionProvider,
      ],
      exports: [connectionProvider],
    };
  }
}
