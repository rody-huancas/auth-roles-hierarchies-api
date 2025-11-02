import { PartialType } from '@nestjs/swagger';
import { CreateModuleRegistryDto } from './create-module-registry.dto';

export class UpdateModuleRegistryDto extends PartialType(CreateModuleRegistryDto) {}
