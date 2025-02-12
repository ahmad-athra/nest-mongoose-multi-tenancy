import {
  BadRequestException,
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  OnApplicationShutdown,
  Provider,
  Scope,
  Type,
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
// export type PojoModuleFactoryOptions = Omit<
// PojoModuleOptions,
// ''
// >
export interface PojoModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  // TODO: implement them
  // useExisting?: Type<MongooseOptionsFactory>;
  // useClass?: Type<MongooseOptionsFactory>;
  // TODO make useFactory Optional
  useFactory: (
    ...args: any[]
    // ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
  ) => Promise<PojoModuleOptions> | PojoModuleOptions;
  inject?: any[];
}

@Global()
@Module({})
export class PojoModule implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string) {
    console.log('Shutdown!!');

    [...PojoModule.connections.values()].forEach(
      async (connection) => connection && (await connection.connection.close()),
    );
  }
  static readonly connections: Map<
    string,
    { connection: Connection; time: NodeJS.Timeout }
  > = new Map();
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

        const connection_db = `${mongooseConnectionName}-${db}`; //unique name for every connection // based on connection name and tenant-id
        console.log(`mongooseConnectionName, ${mongooseConnectionName}`);
        console.log(
          'this.connections.has(db)',
          this.connections.has(connection_db),
        );
        if (this.connections.has(connection_db)) {
          const connectionObj = this.connections.get(connection_db)!;
          if (connectionObj.connection.readyState !== 1) {
            this.connections.delete(connection_db);
          } else {
            connectionObj.time.refresh();
            return this.connections.get(connection_db)!.connection;
          }
        }

        const mongooseOptions = extractMongooseOptions(
          options.mongooseModuleOptions,
        );
        const newConnection = await createConnection(uri, {
          ...mongooseOptions,
          dbName: db,
        }).asPromise();
        const clearFunc = setTimeout(async () => {
          this.connections.delete(connection_db);
          await newConnection.close();
          console.log(
            `clear ${connection_db} from connections, connection_id: ${newConnection.id}`,
          );
        }, 10 * 1000);

        this.connections.set(connection_db, {
          connection: newConnection,
          time: clearFunc,
        });
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

  static forRootAsync(options: PojoModuleAsyncOptions): DynamicModule {
    const { connectionName } = options;
    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider: Provider = {
      provide: MULTI_TENANT_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };

    const multiTenantConnectionOptionsProvider: Provider = {
      provide: MULTI_TENANT_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const connectionProvider: Provider = {
      scope: Scope.REQUEST,
      provide: mongooseConnectionName,
      useFactory: async (request: Request, options: PojoModuleOptions) => {
        const { uri, mongooseModuleOptions } = options;

        const db = request.headers['x-tenant-id']?.toString();
        if (!db)
          throw new BadRequestException(`Missing x-tenant-id ${db} in headers`);

        const connection_db = `${mongooseConnectionName}-${db}`; //unique name for every connection // based on connection name and tenant-id
        console.log(`mongooseConnectionName, ${mongooseConnectionName}`);
        console.log(
          'this.connections.has(db)',
          this.connections.has(connection_db),
        );
        if (this.connections.has(connection_db)) {
          const connectionObj = this.connections.get(connection_db)!;
          if (connectionObj.connection.readyState !== 1) {
            this.connections.delete(connection_db);
          } else {
            connectionObj.time.refresh();
            return this.connections.get(connection_db)!.connection;
          }
        }

        const mongooseOptions = extractMongooseOptions(mongooseModuleOptions);
        const newConnection = await createConnection(uri, {
          ...mongooseOptions,
          dbName: db,
        }).asPromise();
        const clearFunc = setTimeout(async () => {
          this.connections.delete(connection_db);
          await newConnection.close();
          console.log(
            `clear ${connection_db} from connections, connection_id: ${newConnection.id}`,
          );
        }, 10 * 1000);

        this.connections.set(connection_db, {
          connection: newConnection,
          time: clearFunc,
        });
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
      global: true,
    };
  }
}
