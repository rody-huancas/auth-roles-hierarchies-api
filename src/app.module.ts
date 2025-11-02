import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { UseEnvironmentVariables } from './config/env/env.enable';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { OptionsModule } from './modules/options/options.module';
import { ModuleRegistryModule } from './modules/module-registry/module-registry.module';

@Module({
  imports: [
    UseEnvironmentVariables,
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject    : [ConfigService],
    }),
    UsersModule,
    RolesModule,
    OptionsModule,
    ModuleRegistryModule,
  ],
})
export class AppModule {}
