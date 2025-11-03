import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { ModuleRegistryService } from './module-registry.service';
import { CreateModuleRegistryDto } from './dto/create-module-registry.dto';
import { UpdateModuleRegistryDto } from './dto/update-module-registry.dto';

@Controller('module-registry')
export class ModuleRegistryController {
  constructor(private readonly moduleRegistryService: ModuleRegistryService) {}

  @Post()
  create(@Body() createModuleRegistryDto: CreateModuleRegistryDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.moduleRegistryService.create(createModuleRegistryDto, request, userId);
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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateModuleRegistryDto: UpdateModuleRegistryDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.moduleRegistryService.update(id, updateModuleRegistryDto, request, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.moduleRegistryService.remove(id, request, userId);
  }
}
