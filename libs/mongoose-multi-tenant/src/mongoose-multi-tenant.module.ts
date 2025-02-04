import { Module } from '@nestjs/common';
import { MongooseMultiTenantService } from './mongoose-multi-tenant.service';

@Module({
  providers: [MongooseMultiTenantService],
  exports: [MongooseMultiTenantService],
})
export class MongooseMultiTenantModule {}
