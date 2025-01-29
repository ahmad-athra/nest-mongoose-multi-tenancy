import { Connection, createConnection } from 'mongoose';
import {
  MongoTenantsModuleOptionsPOJO,
  MultiTenantModuleOptions,
} from './interface/mongo-tenants-module-options.interface';

/**
 *
 * @param {Connection} connection Mongoose Connection instance to register connection using `useDb` method
 * @param {string} db the tenant name to connect with
 * @returns
 */
export function handleUseDbApproach(
  db: string,
  connection: Connection,
): Connection {
  const x = connection.useDb(db, { useCache: true });
  return connection.useDb(db, { useCache: true });
}

/**
 *
 * @param {Map<string, Connection>} connections - Map contains the list of cached connections
 * @param {string} db - the tenant name to create return its connection
 * @param options
 * @returns
 */
export async function handlePojoApproach(
  db: string,
  options: MultiTenantModuleOptions,
): Promise<Connection> {
  const connectionString = options.uri;
  return createConnection(connectionString, {
    ...options.connectionOptions,
    dbName: db,
  }).asPromise();
}
