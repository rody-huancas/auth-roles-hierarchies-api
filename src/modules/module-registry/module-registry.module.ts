import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRegistry } from './entities/module-registry.entity';
import { ModuleRegistryService } from './module-registry.service';
import { ModuleRegistryController } from './module-registry.controller';

@Module({
  imports    : [TypeOrmModule.forFeature([ModuleRegistry])],
  controllers: [ModuleRegistryController],
  providers  : [ModuleRegistryService],
  exports    : [ModuleRegistryService],
})
export class ModuleRegistryModule {}
