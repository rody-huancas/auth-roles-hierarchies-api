import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Option } from './entities/option.entity';
import { ModuleRegistry } from '../module-registry/entities/module-registry.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option) private readonly optionRepository: Repository<Option>,
    @InjectRepository(ModuleRegistry) private readonly moduleRegistryRepository: Repository<ModuleRegistry>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async create(createOptionDto: CreateOptionDto, request?: any, userId?: string): Promise<Option> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingOption = await queryRunner.manager.findOne(Option, {
        where: { key: createOptionDto.key },
      });

      if (existingOption) {
        throw new ConflictException('La clave de la opción ya está en uso');
      }

      const module = await queryRunner.manager.findOne(ModuleRegistry, {
        where: { id: createOptionDto.moduleId },
      });

      if (!module) {
        throw new NotFoundException(`El módulo con ID ${createOptionDto.moduleId} no existe`);
      }

      const newOption = queryRunner.manager.create(Option, {
        moduleId   : createOptionDto.moduleId,
        key        : createOptionDto.key,
        name       : createOptionDto.name,
        description: createOptionDto.description,
      });

      const savedOption = await queryRunner.manager.save(Option, newOption);

      await queryRunner.commitTransaction();

      // Registrar en audit log
      this.auditService.logCreate(
        'Option',
        savedOption.id,
        {
          moduleId: savedOption.moduleId,
          key: savedOption.key,
          name: savedOption.name,
          description: savedOption.description,
        },
        request,
        userId,
      ).catch(() => {});

      return await this.findOne(savedOption.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al crear la opción');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    moduleId?: string;
  }): Promise<{ data: Option[]; total: number }> {
    try {
      const { skip = 0, take = 10, moduleId } = options || {};

      const queryBuilder = this.optionRepository.createQueryBuilder('option');

      if (moduleId) {
        queryBuilder.where('option.moduleId = :moduleId', { moduleId });
      }

      const [data, total] = await queryBuilder
        .leftJoinAndSelect('option.module', 'module')
        .orderBy('option.createdAt', 'DESC')
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las opciones');
    }
  }

  async findOne(id: string): Promise<Option> {
    try {
      const option = await this.optionRepository.findOne({
        where: { id },
        relations: ['module'],
      });

      if (!option) {
        throw new NotFoundException(`Opción con ID ${id} no encontrada`);
      }

      return option;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al obtener la opción');
    }
  }

  async findByKey(key: string): Promise<Option | null> {
    try {
      return await this.optionRepository.findOne({
        where: { key },
        relations: ['module'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar la opción por clave');
    }
  }

  async findByModuleId(moduleId: string): Promise<Option[]> {
    try {
      return await this.optionRepository.find({
        where: { moduleId },
        relations: ['module'],
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las opciones del módulo');
    }
  }

  async update(id: string, updateOptionDto: UpdateOptionDto, request?: any, userId?: string): Promise<Option> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingOption = await queryRunner.manager.findOne(Option, { where: { id } });

      if (!existingOption) {
        throw new NotFoundException(`Opción con ID ${id} no encontrada`);
      }

      if (updateOptionDto.key && updateOptionDto.key !== existingOption.key) {
        const keyExists = await queryRunner.manager.findOne(Option, {
          where: { key: updateOptionDto.key },
        });

        if (keyExists) {
          throw new ConflictException('La clave de la opción ya está en uso');
        }
      }

      if (updateOptionDto.moduleId && updateOptionDto.moduleId !== existingOption.moduleId) {
        const module = await queryRunner.manager.findOne(ModuleRegistry, {
          where: { id: updateOptionDto.moduleId },
        });

        if (!module) {
          throw new NotFoundException(`El módulo con ID ${updateOptionDto.moduleId} no existe`);
        }
      }

      await queryRunner.manager.update(Option, { id }, updateOptionDto);

      const updatedOption = await queryRunner.manager.findOne(Option, {
        where: { id },
        relations: ['module'],
      });

      await queryRunner.commitTransaction();

      // Registrar en audit log
      const oldValues = {
        moduleId: existingOption.moduleId,
        key: existingOption.key,
        name: existingOption.name,
        description: existingOption.description,
      };
      const newValues = { ...oldValues, ...updateOptionDto };

      this.auditService.logUpdate(
        'Option',
        id,
        oldValues,
        newValues,
        request,
        userId,
      ).catch(() => {});

      return updatedOption!;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar la opción');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, request?: any, userId?: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const option = await queryRunner.manager.findOne(Option, { where: { id } });

      if (!option) {
        throw new NotFoundException(`Opción con ID ${id} no encontrada`);
      }

      await queryRunner.manager.remove(Option, option);

      await queryRunner.commitTransaction();

      // Registrar en audit log
      const oldValues = {
        moduleId: option.moduleId,
        key: option.key,
        name: option.name,
        description: option.description,
      };
      this.auditService.logDelete(
        'Option',
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

      throw new InternalServerErrorException('Error al eliminar la opción');
    } finally {
      await queryRunner.release();
    }
  }
}
