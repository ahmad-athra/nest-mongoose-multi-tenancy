import { Inject, Logger } from '@nestjs/common';
import {
  ContextId,
  ContextIdFactory,
  ContextIdResolver,
  ContextIdResolverFn,
  ContextIdStrategy,
  HostComponentInfo,
} from '@nestjs/core';
import { Request } from 'express';

export class AggregateByTenantContextIdStrategy implements ContextIdStrategy {
  private logger = new Logger(AggregateByTenantContextIdStrategy.name);

  // A collection of context identifiers representing separate DI sub-trees per tenant
  private readonly tenants = new Map<string, ContextId>();

  attach(
    contextId: ContextId,
    request: Request,
  ): ContextIdResolverFn | ContextIdResolver {
    this.logger.log('this.tenants', this.tenants);

    const tenantId = request.headers['x-tenant-id'] as string;
    if (!tenantId) {
      // OR log error depending on what we want to accomplish
      return () => contextId;
    }

    let tenantSubTreeId: ContextId;
    if (this.tenants.has(tenantId)) {
      tenantSubTreeId = this.tenants.get(tenantId) as ContextId;
    } else {
      // Construct a new context id
      tenantSubTreeId = ContextIdFactory.create();
      this.tenants.set(tenantId, tenantSubTreeId);
      setTimeout(async () => {
        this.tenants.delete(tenantId);
      }, 5 * 1000);
    }

    this.logger.log(tenantSubTreeId);

    return {
      payload: { ...request, tenantId },
      resolve: (info: HostComponentInfo) =>
        info.isTreeDurable ? tenantSubTreeId : contextId,
    };
  }
}
