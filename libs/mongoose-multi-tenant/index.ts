// export module
export * from './src/mongoose-multi-tenant.module';

export * from './src/mongoose-multi-tenant.service';

// export interfaces
export * from './interfaces';

//
export {
  InjectMultiTenantConnection,
  InjectMultiTenantModel,
} from './common/mongoose.decorators';
