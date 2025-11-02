import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ModuleRegistryService } from './module-registry.service';
import { CreateModuleRegistryDto } from './dto/create-module-registry.dto';
import { UpdateModuleRegistryDto } from './dto/update-module-registry.dto';

@Controller('module-registry')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Post()
  create(@Body() createModuleRegistryDto: CreateModuleRegistryDto) {
    return this.moduleRegistryService.create(createModuleRegistryDto);
  }

  @Get()
  findAll() {
    return this.moduleRegistryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moduleRegistryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateModuleRegistryDto: UpdateModuleRegistryDto) {
    return this.moduleRegistryService.update(id, updateModuleRegistryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moduleRegistryService.remove(id);
  }
}
