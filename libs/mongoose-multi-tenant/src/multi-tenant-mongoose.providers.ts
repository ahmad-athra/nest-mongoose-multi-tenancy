import { Provider, Scope } from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import { getConnectionToken, getModelToken } from '../utils/token-utils';
import { Connection, Model } from 'mongoose';

export function createMongooseProviders(
  connectionName?: string,
  options: ModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, model) => [
      ...providers,
      ...(model.discriminators || []).map((d) => ({
        provide: getModelToken(d.name, connectionName),
        useFactory: (model: Model<Document>) =>
          model.discriminator(d.name, d.schema, d.value),
        inject: [getModelToken(model.name, connectionName)],
      })),
      {
        provide: getModelToken(model.name, connectionName),
        // scope: Scope.REQUEST,
        useFactory: (connection: Connection) => {
          const model$ = connection.models[model.name]
            ? connection.models[model.name]
            : connection.model(model.name, model.schema, model.collection);
          return model$;
        },
        inject: [getConnectionToken(connectionName)],
      },
    ],
    [] as Provider[],
  );
}
