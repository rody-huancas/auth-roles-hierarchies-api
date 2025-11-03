import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.rolesService.create(createRoleDto, request, userId);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.rolesService.update(id, updateRoleDto, request, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.rolesService.remove(id, request, userId);
  }
}
