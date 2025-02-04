import { Test, TestingModule } from '@nestjs/testing';
import { MongooseMultiTenantService } from './mongoose-multi-tenant.service';

describe('MongooseMultiTenantService', () => {
  let service: MongooseMultiTenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongooseMultiTenantService],
    }).compile();

    service = module.get<MongooseMultiTenantService>(MongooseMultiTenantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
