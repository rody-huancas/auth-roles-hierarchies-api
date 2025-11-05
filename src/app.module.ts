import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CommonModule } from './common/common.module';
import { typeOrmConfig } from './database/typeorm.config';
import { OptionsModule } from './modules/options/options.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ModuleRegistryModule } from './modules/module-registry/module-registry.module';
import { UseEnvironmentVariables } from './config/env/env.enable';

@Module({
  imports: [
    UseEnvironmentVariables,
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject    : [ConfigService],
    }),
    CommonModule,
    UsersModule,
    RolesModule,
    OptionsModule,
    ModuleRegistryModule,
    AuditLogsModule,
  ],
})
export class AppModule {}
