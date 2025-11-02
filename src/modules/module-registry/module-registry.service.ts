import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ModuleRegistry } from './entities/module-registry.entity';
import { CreateModuleRegistryDto } from './dto/create-module-registry.dto';
import { UpdateModuleRegistryDto } from './dto/update-module-registry.dto';

@Injectable()
export class ModuleRegistryService {
  constructor(
    @InjectRepository(ModuleRegistry) private readonly moduleRegistryRepository: Repository<ModuleRegistry>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createModuleRegistryDto: CreateModuleRegistryDto): Promise<ModuleRegistry> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingModule = await queryRunner.manager.findOne(ModuleRegistry, {
        where: { key: createModuleRegistryDto.key },
      });

      if (existingModule) {
        throw new ConflictException('La clave del módulo ya está en uso');
      }

      if (createModuleRegistryDto.parentModuleId) {
        const parentModule = await queryRunner.manager.findOne(ModuleRegistry, {
          where: { id: createModuleRegistryDto.parentModuleId },
        });

        if (!parentModule) {
          throw new NotFoundException(`El módulo padre con ID ${createModuleRegistryDto.parentModuleId} no existe`);
        }

        if (parentModule.parentModuleId === createModuleRegistryDto.parentModuleId) {
          throw new BadRequestException('No se puede crear un módulo con referencia circular');
        }
      }

      const newModule = queryRunner.manager.create(ModuleRegistry, {
        ...createModuleRegistryDto,
        parentModuleId: createModuleRegistryDto.parentModuleId || null,
        orderIndex     : createModuleRegistryDto.orderIndex ?? 0,
        isActive       : createModuleRegistryDto.isActive ?? true,
      });

      const savedModule = await queryRunner.manager.save(ModuleRegistry, newModule);

      await queryRunner.commitTransaction();

      return await this.findOne(savedModule.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear el módulo');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    isActive?: boolean;
    parentModuleId?: string | null;
  }): Promise<{ data: ModuleRegistry[]; total: number }> {
    try {
      const { skip = 0, take = 10, isActive, parentModuleId } = options || {};

      const queryBuilder = this.moduleRegistryRepository.createQueryBuilder('module');

      if (isActive !== undefined) {
        queryBuilder.where('module.isActive = :isActive', { isActive });
      }

      if (parentModuleId !== undefined) {
        if (parentModuleId === null) {
          queryBuilder.andWhere('module.parentModuleId IS NULL');
        } else {
          queryBuilder.andWhere('module.parentModuleId = :parentModuleId', {
            parentModuleId,
          });
        }
      }

      const [data, total] = await queryBuilder
        .leftJoinAndSelect('module.parent', 'parent')
        .leftJoinAndSelect('module.children', 'children')
        .orderBy('module.orderIndex', 'ASC')
        .addOrderBy('module.createdAt', 'ASC')
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los módulos');
    }
  }

  async findRootModules(): Promise<ModuleRegistry[]> {
    try {
      return await this.moduleRegistryRepository.find({
        where    : { parentModuleId: IsNull() },
        relations: ['children'],
        order    : { orderIndex: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los módulos raíz');
    }
  }

  async findOne(id: string): Promise<ModuleRegistry> {
    try {
      const module = await this.moduleRegistryRepository.findOne({
        where: { id },
        relations: ['parent', 'children'],
      });

      if (!module) {
        throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
      }

      return module;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al obtener el módulo');
    }
  }

  async findByKey(key: string): Promise<ModuleRegistry | null> {
    try {
      return await this.moduleRegistryRepository.findOne({
        where: { key },
        relations: ['parent', 'children'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar el módulo por clave');
    }
  }

  async findChildren(parentId: string): Promise<ModuleRegistry[]> {
    try {
      return await this.moduleRegistryRepository.find({
        where: { parentModuleId: parentId },
        order: { orderIndex: 'ASC', createdAt: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los módulos hijos');
    }
  }

  async update(id: string, updateModuleRegistryDto: UpdateModuleRegistryDto): Promise<ModuleRegistry> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingModule = await queryRunner.manager.findOne(ModuleRegistry, { where: { id } });

      if (!existingModule) {
        throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
      }

      if (updateModuleRegistryDto.key && updateModuleRegistryDto.key !== existingModule.key) {
        const keyExists = await queryRunner.manager.findOne(ModuleRegistry, {
          where: { key: updateModuleRegistryDto.key },
        });

        if (keyExists) {
          throw new ConflictException('La clave del módulo ya está en uso');
        }
      }

      if (updateModuleRegistryDto.parentModuleId !== undefined) {
        if (updateModuleRegistryDto.parentModuleId === id) {
          throw new BadRequestException('Un módulo no puede ser su propio padre');
        }

        if (updateModuleRegistryDto.parentModuleId !== null) {
          const parentModule = await queryRunner.manager.findOne(ModuleRegistry, {
            where: { id: updateModuleRegistryDto.parentModuleId },
          });

          if (!parentModule) {
            throw new NotFoundException(`El módulo padre con ID ${updateModuleRegistryDto.parentModuleId} no existe`);
          }

          const isDescendant = await this.checkIfDescendant(
            queryRunner,
            updateModuleRegistryDto.parentModuleId,
            id,
          );

          if (isDescendant) {
            throw new BadRequestException('No se puede asignar un descendiente como padre (evita ciclos)');
          }
        }
      }

      await queryRunner.manager.update(ModuleRegistry, { id }, updateModuleRegistryDto);

      const updatedModule = await queryRunner.manager.findOne(ModuleRegistry, {
        where: { id },
        relations: ['parent', 'children'],
      });

      await queryRunner.commitTransaction();

      return updatedModule!;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el módulo');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const module = await queryRunner.manager.findOne(ModuleRegistry, {
        where: { id },
        relations: ['children'],
      });

      if (!module) {
        throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
      }

      if (module.children && module.children.length > 0) {
        throw new BadRequestException('No se puede eliminar un módulo que tiene hijos. Elimine primero los módulos hijos.');
      }

      await queryRunner.manager.remove(ModuleRegistry, module);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar el módulo');
    } finally {
      await queryRunner.release();
    }
  }

  private async checkIfDescendant(queryRunner: any, ancestorId: string, descendantId: string): Promise<boolean> {
    const ancestor = await queryRunner.manager.findOne(ModuleRegistry, {
      where: { id: ancestorId },
      relations: ['children'],
    });

    if (!ancestor) {
      return false;
    }

    if (ancestor.id === descendantId) {
      return false;
    }

    const checkChildren = async (children: ModuleRegistry[]): Promise<boolean> => {
      for (const child of children) {
        if (child.id === descendantId) {
          return true;
        }

        const childWithChildren = await queryRunner.manager.findOne(ModuleRegistry, {
          where: { id: child.id },
          relations: ['children'],
        });

        if (childWithChildren && childWithChildren.children.length > 0) {
          const found = await checkChildren(childWithChildren.children);
          if (found) {
            return true;
          }
        }
      }
      return false;
    };

    if (ancestor.children && ancestor.children.length > 0) {
      return await checkChildren(ancestor.children);
    }

    return false;
  }
}
