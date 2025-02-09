import { Inject } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '../utils/token-utils';

export const InjectMultiTenantModel = (
  model: string,
  connectionName?: string,
) => {
  // const multiTenantConnectionName = getConnectionToken(connectionName);
  return Inject(getModelToken(model, connectionName));
};

export const InjectMultiTenantConnection = (name?: string) =>
  Inject(getConnectionToken(name));
