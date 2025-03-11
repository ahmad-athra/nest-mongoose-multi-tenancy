import {
  DynamicModule,
  Global,
  Logger,
  Module,
  Provider,
} from '@nestjs/common';
import { ModelDefinition } from '@nestjs/mongoose';
import {
  REQUEST_TENANT_KEY_TOKEN,
  TENANT_KEY_TOKEN,
} from '../constants/multi-tenant.constants';
import {
  CONNECTION_MODE,
  MultiTenantModuleAsyncOptions,
  MultiTenantModuleOptions,
} from '../interfaces';
import { TenantContextService } from '../providers/tenant-context/tenant-context.service';
import {
  getRequestKey,
  getTenantKey,
  tenantValidatorProvider,
} from '../utils/token-utils';
import { PojoModule } from './core-modules/pojo/pojo.module';
import { createMongooseProviders } from './multi-tenant-mongoose.providers';

@Global() //TODO: remove it, move config provider to global module
@Module({
  providers: [TenantContextService],
})
export class MongooseMultiTenantModule {
  private static logger = new Logger('MongooseMultiTenantModule');

  static forRoot(options: MultiTenantModuleOptions): DynamicModule {
    const commonProviders: Provider[] = [
      /**  not needed since we use [TenantContextService]
       * we use it only to reduce rewrite middlewares
       *
       */
      {
        provide: TENANT_KEY_TOKEN,
        useFactory: () => getTenantKey(options.tenantKey),
      },
      {
        provide: REQUEST_TENANT_KEY_TOKEN,
        useFactory: () => getRequestKey(options.requestKey),
      },
      tenantValidatorProvider(options.tenantValidator),
      TenantContextService,
    ];

    if (options.mode === CONNECTION_MODE.pojo) {
      return {
        module: MongooseMultiTenantModule,
        providers: [...commonProviders],
        imports: [PojoModule.forRoot(options)],
        exports: [...commonProviders],
      };
    }

    this.logger.error('NOT PROVIDED', this);
    throw new Error('NOT PROVIDED');
  }

  static forRootAsync(options: MultiTenantModuleAsyncOptions): DynamicModule {
    const commonProviders: Provider[] = [
      {
        provide: TENANT_KEY_TOKEN,
        useFactory: () => getTenantKey(options.tenantKey),
      },
      {
        provide: REQUEST_TENANT_KEY_TOKEN,
        useFactory: () => getRequestKey(options.requestKey),
      },
      tenantValidatorProvider(options.tenantValidator),
      TenantContextService,
    ];

    if (options.mode === CONNECTION_MODE.pojo) {
      return {
        module: MongooseMultiTenantModule,
        providers: [...commonProviders],
        imports: [PojoModule.forRootAsync(options)],
        exports: [...commonProviders, PojoModule],
      };
    }

    this.logger.error('NOT PROVIDED', this);
    throw new Error('NOT PROVIDED');
  }

  static forFeature(
    models: ModelDefinition[] = [],
    connectionName?: string,
  ): DynamicModule {
    const providers: Provider[] = createMongooseProviders(
      connectionName,
      models,
    );

    return {
      module: MongooseMultiTenantModule,
      // imports: [PojoModule],
      providers: providers,
      exports: [...providers, MongooseMultiTenantModule],
    };
  }
}
