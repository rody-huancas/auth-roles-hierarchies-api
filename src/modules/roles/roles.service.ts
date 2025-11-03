import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async create(createRoleDto: CreateRoleDto, request?: any, userId?: string): Promise<Role> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingRole = await queryRunner.manager.findOne(Role, {
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('El nombre del rol ya está en uso');
      }

      const newRole   = queryRunner.manager.create(Role, createRoleDto);
      const savedRole = await queryRunner.manager.save(Role, newRole);

      await queryRunner.commitTransaction();

      // Registrar en audit log
      this.auditService.logCreate(
        'Role',
        savedRole.id,
        { name: savedRole.name, description: savedRole.description },
        request,
        userId,
      ).catch(() => {});

      return savedRole;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el rol');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<{ data: Role[]; total: number }> {
    try {
      const { skip = 0, take = 10 } = options || {};

      const [data, total] = await this.roleRepository.findAndCount({
        skip,
        take,
        order: { createdAt: 'DESC' },
      });

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los roles');
    }
  }

  async findOne(id: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });

      if (!role) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      return role;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al obtener el rol');
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      return await this.roleRepository.findOne({ where: { name } });
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar el rol por nombre');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, request?: any, userId?: string): Promise<Role> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingRole = await queryRunner.manager.findOne(Role, { where: { id } });

      if (!existingRole) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
        const nameExists = await queryRunner.manager.findOne(Role, {
          where: { name: updateRoleDto.name },
        });

        if (nameExists) {
          throw new ConflictException('El nombre del rol ya está en uso');
        }
      }

      await queryRunner.manager.update(Role, { id }, updateRoleDto);

      const updatedRole = await queryRunner.manager.findOne(Role, { where: { id } });

      await queryRunner.commitTransaction();

      // Registrar en audit log
      const oldValues = { name: existingRole.name, description: existingRole.description };
      const newValues = { ...oldValues, ...updateRoleDto };

      this.auditService.logUpdate(
        'Role',
        id,
        oldValues,
        newValues,
        request,
        userId,
      ).catch(() => {});

      return updatedRole!;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el rol');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, request?: any, userId?: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const role = await queryRunner.manager.findOne(Role, { where: { id } });

      if (!role) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      await queryRunner.manager.remove(Role, role);

      await queryRunner.commitTransaction();

      // Registrar en audit log
      const oldValues = { name: role.name, description: role.description };
      this.auditService.logDelete(
        'Role',
        id,
        oldValues,
        request,
        userId,
      ).catch(() => {});
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar el rol');
    } finally {
      await queryRunner.release();
    }
  }
}
