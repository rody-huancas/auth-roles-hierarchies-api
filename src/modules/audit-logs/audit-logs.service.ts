import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newAuditLog = queryRunner.manager.create(AuditLog, createAuditLogDto);

      const savedAuditLog = await queryRunner.manager.save(AuditLog, newAuditLog);

      await queryRunner.commitTransaction();

      return savedAuditLog;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException('Error al crear el log de auditoría');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<{ data: AuditLog[]; total: number }> {
    try {
      const { skip = 0, take = 10 } = options || {};

      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('auditLog');

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(take)
        .orderBy('auditLog.createdAt', 'DESC')
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los logs de auditoría');
    }
  }

  async findOne(id: string): Promise<AuditLog> {
    try {
      const auditLog = await this.auditLogRepository.findOne({ where: { id } });

      if (!auditLog) {
        throw new NotFoundException(`Log de auditoría con ID ${id} no encontrado`);
      }

      return auditLog;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al obtener el log de auditoría');
    }
  }

  async findByEntity(options?: { 
    entityType?: string; 
    entityId?: string; 
    skip?: number; 
    take?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    try {
      const { entityType, entityId, skip = 0, take = 10 } = options || {};

      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('auditLog');

      if (entityType) {
        queryBuilder.andWhere('auditLog.entityType = :entityType', { entityType });
      }

      if (entityId) {
        queryBuilder.andWhere('auditLog.entityId = :entityId', { entityId });
      }

      const [data, total] = await queryBuilder
        .skip(skip)
        .take(take)
        .orderBy('auditLog.createdAt', 'DESC')
        .getManyAndCount();

      return { data, total };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los logs de auditoría por entidad');
    }
  }

  async update(id: string, updateAuditLogDto: UpdateAuditLogDto): Promise<AuditLog> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAuditLog = await queryRunner.manager.findOne(AuditLog, { where: { id } });

      if (!existingAuditLog) {
        throw new NotFoundException(`Log de auditoría con ID ${id} no encontrado`);
      }

      await queryRunner.manager.update(AuditLog, { id }, updateAuditLogDto);

      const updatedAuditLog = await queryRunner.manager.findOne(AuditLog, { where: { id } });

      await queryRunner.commitTransaction();

      return updatedAuditLog!;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al actualizar el log de auditoría');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const auditLog = await queryRunner.manager.findOne(AuditLog, { where: { id } });

      if (!auditLog) {
        throw new NotFoundException(`Log de auditoría con ID ${id} no encontrado`);
      }

      await queryRunner.manager.remove(AuditLog, auditLog);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al eliminar el log de auditoría');
    } finally {
      await queryRunner.release();
    }
  }
}
