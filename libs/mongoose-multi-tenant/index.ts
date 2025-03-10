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

export { ValidateTenantMiddleware } from './middlewares/tenant-validator/validate-tenant.middleware';
