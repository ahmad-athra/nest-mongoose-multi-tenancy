import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import {
  REQUEST_TENANT_KEY_TOKEN,
  TENANT_KEY_TOKEN,
} from 'libs/multi-tenant/constants/providers.constants';

@Injectable()
export class GetTenantNameMiddleware implements NestMiddleware {
  constructor(
    @Inject(TENANT_KEY_TOKEN) private readonly tenantKey: string,
    @Inject(REQUEST_TENANT_KEY_TOKEN) private readonly requestTenantKey: string,
  ) {}
  // private logger: Logger = new Logger(GetTenantNameMiddleware.name)

  use(req: Request, res: any, next: () => void) {
    const db = req.headers[this.tenantKey]?.toString();
    if (!db) {
      throw new BadRequestException(`${this.tenantKey} NOT PROVIDED`);
    }
    req[this.requestTenantKey] = db;
    next();
  }
}
