import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  Optional,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import {
  REQUEST_TENANT_KEY_TOKEN,
  TENANT_KEY_TOKEN,
  TENANT_VALIDATOR_TOKEN,
} from 'libs/mongoose-multi-tenant/constants/multi-tenant.constants';
import { ITenantValidator } from 'libs/mongoose-multi-tenant/interfaces';
import { TenantContextService } from 'libs/mongoose-multi-tenant/providers/tenant-context/tenant-context.service';
import { isObservable, lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class ValidateTenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(REQUEST_TENANT_KEY_TOKEN)
    private readonly tenantRequestKey: string,
    @Inject(TENANT_KEY_TOKEN)
    private readonly tenantKey: string,
    @Optional()
    @Inject(TENANT_VALIDATOR_TOKEN)
    private readonly tenantValidatorClass: ITenantValidator,
    private readonly tenantContext: TenantContextService,
  ) {}

  private readonly logger = new Logger(ValidateTenantMiddleware.name);
  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers[this.tenantKey]?.toString()?.trim();

    if (!tenantId)
      throw new BadRequestException(
        `Missing TENANT IDENTIFIER [${this.tenantKey}]`,
      );

    if (this.tenantValidatorClass?.validate) {
      const source = this.tenantValidatorClass.validate(tenantId);
      const isValid = await this.validate(source);
      if (!isValid)
        throw new ForbiddenException(
          `Not Authorize to access this source [${tenantId}]`,
        );
    }
    this.tenantContext.setTenantId(tenantId);
    next();
  }

  async validate(source: boolean | Promise<boolean> | Observable<boolean>) {
    if (isObservable(source)) return await lastValueFrom(source);
    return Promise.resolve(source);
  }
}
