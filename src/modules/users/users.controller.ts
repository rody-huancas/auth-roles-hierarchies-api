import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() request: Request) {
    // TODO: Obtener userId del token JWT cuando implementes autenticación
    const userId = (request as any).user?.id;
    return this.usersService.create(createUserDto, request, userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const userId = (request as any).user?.id;
    return this.usersService.update(id, updateUserDto, request, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.usersService.remove(id, request, userId);
  }
}
