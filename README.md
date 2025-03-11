# Mongoose Multi-Tenant Module for NestJS & Mongoose

## Overview

The `mongoose-multi-tenant` module provides a flexible and scalable way to manage multi-tenant MongoDB connections in a NestJS application. It supports different connection modes and enables tenant-specific validation and context management.

## Features

- Tenant-aware dependency injection using custom decorators
- Middleware for validating tenant requests
- Customizable tenant validation logic with `ITenantValidator`
- Integration with NestJS providers and modules
- Automatic connection management with configurable cleanup intervals (Preview)
- Connection Modes:
  - ✅ pojo (Implemented): Creates and caches connections dynamically for each tenant.
  - 🔜 useDb (Planned): Will use mongoose.connection.useDb() for switching tenants.
- Control which tenant using DI to easily integrated with `HTTP`, `Microservice`, Context

## Installation

<!-- ```sh
npm install mongoose-multi-tenant
``` -->

```sh
npm install @nixpend/mongoose-utils
```

## Usage

### Registering the Module

#### Synchronous Registration

```typescript
import { MongooseMultiTenantModule } from 'mongoose-multi-tenant';

@Module({
  imports: [
    MongooseMultiTenantModule.forRoot({
      mode: CONNECTION_MODE.pojo,
      uri: 'mongodb://localhost:27017',
      tenantKey: 'x-tenant-id',
      requestKey: 'tenant-id',
      clearInterval: 60000, // Auto-close inactive connections after 60 seconds
    }),
  ],
})
export class AppModule {}
```

#### Asynchronous Registration

```typescript
@Module({
  imports: [
    MongooseMultiTenantModule.forRootAsync({
      mode: CONNECTION_MODE.pojo,
      useFactory: async () => ({
        uri: 'mongodb://localhost:27017',
      }),
      inject: [],
    }),
  ],
})
export class AppModule {}
```

### Registering Models

```typescript
@Module({
  imports: [
    MongooseMultiTenantModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
  ],
})
export class UserModule {}
```

### Injecting Multi-Tenant Dependencies

#### Injecting a Multi-Tenant Model

```typescript
import { InjectMultiTenantModel } from 'mongoose-multi-tenant';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectMultiTenantModel('User') private readonly userModel: Model<User>,
  ) {}

  async createUser(dto: CreateUserDto) {
    return new this.userModel(dto).save();
  }
}
```

#### Injecting a Multi-Tenant Connection

```typescript
import { InjectMultiTenantConnection } from 'mongoose-multi-tenant';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectMultiTenantConnection() private readonly connection: Connection,
  ) {}

  async getCollectionNames() {
    return this.connection.db.listCollections().toArray();
  }
}
```

## Tenant Validation Middleware

To validate tenants before processing requests, use `ValidateTenantMiddleware`.

### Applying Middleware Globally

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ValidateTenantMiddleware } from 'mongoose-multi-tenant';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ValidateTenantMiddleware).forRoutes('*');
  }
}
```

### Custom Tenant Validator

You can define a custom validator by implementing `ITenantValidator`.

```typescript
import { Injectable } from '@nestjs/common';
import { ITenantValidator } from 'mongoose-multi-tenant';

@Injectable()
export class CustomTenantValidator implements ITenantValidator {
  validate(tenantId: string): boolean | Promise<boolean> {
    return tenantId === 'valid-tenant'; // Implement your logic
  }
}
```

Then, register it in the module:

```typescript
@Module({
  imports: [
    MongooseMultiTenantModule.forRoot({
      mode: CONNECTION_MODE.pojo,
      uri: 'mongodb://localhost:27017',
      tenantValidator: CustomTenantValidator,
    }),
  ],
})
export class AppModule {}
```

## Configuration Options

| Option            | Type                                | Description                                        |
| ----------------- | ----------------------------------- | -------------------------------------------------- |
| `mode`            | `CONNECTION_MODE`                   | Connection mode (currently supports `pojo`).       |
| `uri`             | `string`                            | MongoDB connection URI.                            |
| `tenantKey`       | `string`                            | Header key to extract tenant ID.                   |
| `requestKey`      | `string`                            | Key for storing tenant ID in the request context.  |
| `clearInterval`   | `number` (optional)                 | Time (ms) before an inactive connection is closed. |
| `tenantValidator` | `Type<ITenantValidator>` (optional) | Custom tenant validation provider.                 |

## License

This project is licensed under the MIT License.
