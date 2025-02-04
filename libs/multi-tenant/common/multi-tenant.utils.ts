import { Logger } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection, createConnection } from 'mongoose';
import { MultiTenantModuleOptions } from 'multi-tenant/multi-tenant/interface';

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
  const logger = new Logger('MultiTenantModule');
  const currentConnection = connection.useDb(db, { useCache: true });
  logger.debug(
    `Connecting to tenant: ${db}, Connection id ${currentConnection.id}`,
  );
  return currentConnection;
}
// ------------------------------------------------------------
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
  const logger = new Logger('MultiTenantModule');
  const connectionString = options.uri;
  const mongooseOptions = extractMongooseOptions(options.mongooseModuleOptions);
  const currentConnection = createConnection(connectionString, {
    ...mongooseOptions,
    dbName: db,
  }).asPromise();
  logger.debug(
    `Connecting to tenant: ${db}, Connection id ${(await currentConnection).id}`,
  );
  return currentConnection;
}

export function extractMongooseOptions(options: MongooseModuleOptions = {}) {
  const {
    connectionName,
    uri,
    retryAttempts,
    retryDelay,
    connectionFactory,
    connectionErrorFactory,
    lazyConnection,
    onConnectionCreate,
    verboseRetryLog,
    ...mongooseOptions
  } = options;
  return mongooseOptions;
}
