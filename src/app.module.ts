import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { UseEnvironmentVariables } from './config/env/env.enable';

@Module({
  imports: [
    UseEnvironmentVariables,
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject    : [ConfigService],
    }),
  ],
})
export class AppModule {}
