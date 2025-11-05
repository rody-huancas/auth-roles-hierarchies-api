import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLog } from '../../modules/audit-logs/entities/audit-log.entity';

export interface AuditLogData {
  action     : string;
  entityType : string;
  entityId   : string;
  userId    ?: string;
  oldValues ?: Record<string, any>;
  newValues ?: Record<string, any>;
  ipAddress ?: string;
  userAgent ?: string;
}

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Logs an action to the audit trail asynchronously
   * (does not block the main operation)
   */
  async logAction(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.dataSource.manager.create(AuditLog, {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId,
        oldValues: data.oldValues || {},
        newValues: data.newValues || {},
        ipAddress: data.ipAddress || 'system',
        userAgent: data.userAgent || 'system',
      });

      // Fire and forget to avoid blocking main operation
      this.dataSource.manager
        .save(AuditLog, auditLog)
        .catch((error) => {
          this.logger.error('Failed to save audit log', error);
        });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  /**
   * Extracts IP address and User-Agent from request
   */
  static getRequestInfo(request?: any): RequestInfo {
    if (!request) {
      return { ipAddress: 'system', userAgent: 'system' };
    }

    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers?.['user-agent'] || 'unknown';

    return { ipAddress, userAgent };
  }

  private static extractIpAddress(request: any): string {
    const sources = [
      request.ip,
      request.connection?.remoteAddress,
      request.headers?.['x-forwarded-for']?.split(',')[0]?.trim(),
      request.headers?.['x-real-ip'],
      request.socket?.remoteAddress,
    ];

    return sources.find(ip => ip && ip !== '::1') || 'unknown';
  }

  /**
   * Logs a CREATE action
   */
  async logCreate(
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    request?: any,
    userId?: string,
  ): Promise<void> {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(request);

    await this.logAction({
      action: 'CREATE',
      entityType,
      entityId,
      userId,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Logs an UPDATE action
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    request?: any,
    userId?: string,
  ): Promise<void> {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(request);

    await this.logAction({
      action: 'UPDATE',
      entityType,
      entityId,
      userId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Logs a DELETE action
   */
  async logDelete(
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    request?: any,
    userId?: string,
  ): Promise<void> {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(request);

    await this.logAction({
      action: 'DELETE',
      entityType,
      entityId,
      userId,
      oldValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Logs a LOGIN action
   */
  async logLogin(
    userId: string,
    request?: any,
    success: boolean = true,
  ): Promise<void> {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(request);

    await this.logAction({
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      entityType: 'User',
      entityId: userId,
      userId,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Logs a LOGOUT action
   */
  async logLogout(userId: string, request?: any): Promise<void> {
    const { ipAddress, userAgent } = AuditService.getRequestInfo(request);

    await this.logAction({
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      userId,
      ipAddress,
      userAgent,
    });
  }
}
