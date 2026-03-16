import { db } from './db';
import { getServerSession } from './auth/server';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}

interface AuditConfig {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  userId?: string;
}

/**
 * Log an action to the audit trail
 */
export async function logAction(config: AuditConfig) {
  try {
    let userId = config.userId;
    
    // If userId not provided, try to get from session
    if (!userId) {
      const session = await getServerSession();
      userId = session?.user.id;
    }

    await db.auditLog.create({
      data: {
        userId,
        action: config.action,
        entityType: config.entityType,
        entityId: config.entityId,
        oldValue: config.oldValue ? JSON.stringify(config.oldValue) : null,
        newValue: config.newValue ? JSON.stringify(config.newValue) : null,
      },
    });
  } catch (error) {
    // We don't want audit logging to break the main application flow
    console.error('Failed to log audit action:', error);
  }
}
