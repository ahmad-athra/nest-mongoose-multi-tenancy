import {
  BadRequestException,
  DynamicModule,
  Global,
  Module,
  OnApplicationShutdown,
  Provider,
  Scope,
} from '@nestjs/common';
import {
  MULTI_TENANT_CONNECTION_NAME,
  MULTI_TENANT_OPTIONS,
} from 'libs/mongoose-multi-tenant/constants/multi-tenant.constants';
import {
  PojoModuleAsyncOptions,
  PojoModuleOptions,
} from 'libs/mongoose-multi-tenant/interfaces/pojo.interface';
import { TenantContextService } from 'libs/mongoose-multi-tenant/providers/tenant-context/tenant-context.service';
import {
  extractMongooseOptions,
  getConnectionToken,
} from 'libs/mongoose-multi-tenant/utils/token-utils';
import { Connection, createConnection } from 'mongoose';

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
    { connection: Connection; timeout?: NodeJS.Timeout }
  > = new Map();
  static forRoot(options: PojoModuleOptions): DynamicModule {
    const { uri, mongooseModuleOptions, clearInterval } = options;
    const { connectionName } = mongooseModuleOptions || {};

    const mongooseConnectionName = getConnectionToken(connectionName);

    const mongooseConnectionNameProvider: Provider = {
      provide: MULTI_TENANT_CONNECTION_NAME,
      useValue: mongooseConnectionName,
    };
    const multiTenantConnectionOptionsProvider: Provider = {
      provide: MULTI_TENANT_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      scope: Scope.REQUEST,
      durable: true,
      provide: mongooseConnectionName,
      useFactory: async (
        tenantContext: TenantContextService,
        options: PojoModuleOptions,
      ) => {
        const db = tenantContext.getTenantId();
        if (!db)
          throw new BadRequestException(`Missing x-tenant-id ${db} in headers`);

        const connection_db = `${mongooseConnectionName}-${db}`; //unique name for every connection // based on connection name and tenant-id
        if (this.connections.has(connection_db)) {
          const connectionObj = this.connections.get(connection_db)!;
          if (connectionObj.connection.readyState !== 1) {
            this.connections.delete(connection_db);
          } else {
            connectionObj.timeout?.refresh();
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

        let timeout: NodeJS.Timeout | undefined;
        if (clearInterval && clearInterval > 0) {
          timeout = setTimeout(async () => {
            this.connections.delete(connection_db);
            await newConnection.close();
            console.log(
              `clear ${connection_db} from connections, connection_id: ${newConnection.id}`,
            );
          }, clearInterval);
        }

        this.connections.set(connection_db, {
          connection: newConnection,
          timeout,
        });
        return newConnection;
      },
      inject: [TenantContextService, MULTI_TENANT_OPTIONS],
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
    const { connectionName, clearInterval } = options;

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
      durable: true,
      provide: mongooseConnectionName,
      useFactory: async (
        tenantContext: TenantContextService,
        useFactoryOption: PojoModuleOptions,
      ) => {
        const { uri, mongooseModuleOptions } = useFactoryOption;

        const db = tenantContext.getTenantId();
        if (!db)
          throw new BadRequestException(`Missing x-tenant-id ${db} in headers`);

        const connection_db = `${mongooseConnectionName}-${db}`; //unique name for every connection // based on connection name and tenant-id
        if (this.connections.has(connection_db)) {
          const connectionObj = this.connections.get(connection_db)!;
          if (connectionObj.connection.readyState !== 1) {
            this.connections.delete(connection_db);
          } else {
            connectionObj.timeout?.refresh();
            return this.connections.get(connection_db)!.connection;
          }
        }

        const mongooseOptions = extractMongooseOptions(mongooseModuleOptions);
        const newConnection = await createConnection(uri, {
          ...mongooseOptions,
          dbName: db,
        }).asPromise();

        let timeout: NodeJS.Timeout | undefined;
        if (clearInterval && clearInterval > 0) {
          timeout = setTimeout(async () => {
            this.connections.delete(connection_db);
            await newConnection.close();
            console.log(
              `clear ${connection_db} from connections, connection_id: ${newConnection.id}`,
            );
          }, clearInterval);
        }

        this.connections.set(connection_db, {
          connection: newConnection,
          timeout,
        });
        return newConnection;
      },
      inject: [TenantContextService, MULTI_TENANT_OPTIONS],
    };

    return {
      module: PojoModule,
      providers: [
        mongooseConnectionNameProvider,
        multiTenantConnectionOptionsProvider,
        connectionProvider,
      ],
      exports: [connectionProvider],
      // global: true,
    };
  }
}
