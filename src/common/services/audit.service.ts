import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLog } from '../../modules/audit-logs/entities/audit-log.entity';

export interface AuditLogData {
  action     : string;
  entityType : string;
  entityId   : string;
  oldValues ?: Record<string, any>;
  newValues ?: Record<string, any>;
  ipAddress ?: string;
  userAgent ?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly dataSource: DataSource) {}

    /**
   * Registra una acción en el log de auditoría de forma asíncrona
   * (no bloquea la operación principal)
   */
  async logAction(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.dataSource.manager.create(AuditLog, {
        action    : data.action,
        entityType: data.entityType,
        entityId  : data.entityId,
        oldValues : data.oldValues || {},
        newValues : data.newValues || {},
        ipAddress : data.ipAddress || 'system',
        userAgent : data.userAgent || 'system',
      });

        // Se guarda de forma asíncrona sin esperar (fire and forget)
        // para no bloquear la operación principal
      this.dataSource.manager.save(AuditLog, auditLog).catch((error) => {
          // Log del error pero no lanzamos excepción para no afectar la operación principal
        console.error('Error al registrar audit log:', error);
      });
    } catch (error) {
        // Si hay error, solo lo registramos pero no afectamos la operación principal
      console.error('Error al crear audit log:', error);
    }
  }

    /**
   * Helper para obtener IP y User-Agent del request
   */
  static getRequestInfo(request: any): { ipAddress: string; userAgent: string } {
    const ipAddress = 
      request?.ip ||
      request?.connection?.remoteAddress ||
      request?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      request?.headers?.['x-real-ip'] ||
      'unknown';

    const userAgent = request?.headers?.['user-agent'] || 'unknown';

    return { ipAddress: ipAddress.toString(), userAgent };
  }

    /**
   * Registra una acción CREATE
   */
  async logCreate(
  entityType : string,
  entityId   : string,
  newValues  : Record<string, any>,
  request   ?: any,
  userId    ?: string,
  )          : Promise<void> {
    const { ipAddress, userAgent } = request ? AuditService.getRequestInfo(request) : { ipAddress: 'system', userAgent: 'system' };

    const valuesWithUser = userId ? { ...newValues, _createdBy: userId } : newValues;

    await this.logAction({
      action: 'CREATE',
      entityType,
      entityId,
      newValues: valuesWithUser,
      ipAddress,
      userAgent,
    });
  }

    /**
   * Registra una acción UPDATE
   */
  async logUpdate(
  entityType : string,
  entityId   : string,
  oldValues  : Record<string, any>,
  newValues  : Record<string, any>,
  request   ?: any,
  userId    ?: string,
  ) : Promise<void> {
    const { ipAddress, userAgent } = request ? AuditService.getRequestInfo(request) : { ipAddress: 'system', userAgent: 'system' };

    const newValuesWithUser = userId ? { ...newValues, _updatedBy: userId } : newValues;

    await this.logAction({
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues: newValuesWithUser,
      ipAddress,
      userAgent,
    });
  }

    /**
   * Registra una acción DELETE
   */
  async logDelete(
  entityType : string,
  entityId   : string,
  oldValues  : Record<string, any>,
  request   ?: any,
  userId    ?: string,
  ) : Promise<void> {
    const { ipAddress, userAgent } = request ? AuditService.getRequestInfo(request) : { ipAddress: 'system', userAgent: 'system' };

    const oldValuesWithUser = userId ? { ...oldValues, _deletedBy: userId } : oldValues;

    await this.logAction({
      action: 'DELETE',
      entityType,
      entityId,
      oldValues: oldValuesWithUser,
      ipAddress,
      userAgent,
    });
  }
}

