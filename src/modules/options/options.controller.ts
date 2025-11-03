import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Post()
  create(@Body() createOptionDto: CreateOptionDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.optionsService.create(createOptionDto, request, userId);
  }

  @Get()
  findAll() {
    return this.optionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.optionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOptionDto: UpdateOptionDto, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.optionsService.update(id, updateOptionDto, request, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const userId = (request as any).user?.id;
    return this.optionsService.remove(id, request, userId);
  }
}
