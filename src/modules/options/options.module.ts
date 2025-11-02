import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Option } from './entities/option.entity';
import { ModuleRegistry } from '../module-registry/entities/module-registry.entity';
import { OptionsService } from './options.service';
import { OptionsController } from './options.controller';

@Module({
  imports    : [TypeOrmModule.forFeature([Option, ModuleRegistry])],
  controllers: [OptionsController],
  providers  : [OptionsService],
  exports    : [OptionsService],
})
export class OptionsModule {}
