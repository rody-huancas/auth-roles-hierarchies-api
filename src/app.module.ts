import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { UseEnvironmentVariables } from './config/env/env.enable';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    UseEnvironmentVariables,
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject    : [ConfigService],
    }),
    UsersModule,
  ],
})
export class AppModule {}
