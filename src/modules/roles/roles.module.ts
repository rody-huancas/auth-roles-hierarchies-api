import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolePermissions } from './entities/role-permissions.entity';

@Module({
  imports    : [TypeOrmModule.forFeature([Role, RolePermissions])],
  controllers: [RolesController],
  providers  : [RolesService],
  exports    : [RolesService],
})
export class RolesModule {}
