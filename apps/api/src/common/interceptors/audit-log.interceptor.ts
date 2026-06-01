import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Writes an audit record for every authenticated mutating request, after the
 * handler succeeds. Fire-and-forget — auditing never blocks or fails the response.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    return next.handle().pipe(
      tap(() => {
        if (!user || !MUTATING_METHODS.has(request.method)) return;

        // path like /api/admin/organizations/:id -> resourceType "organizations"
        const segments = request.path.split('/').filter(Boolean);
        const apiIdx = segments.indexOf('api');
        const resourceType =
          apiIdx >= 0 ? segments[apiIdx + 1] === 'admin'
            ? segments[apiIdx + 2]
            : segments[apiIdx + 1]
          : undefined;

        this.prisma.auditLog
          .create({
            data: {
              action: `${request.method} ${request.path}`,
              userId: user.id,
              organizationId: user.organizationId,
              resourceType: resourceType ?? null,
              ipAddress: request.ip ?? null,
            },
          })
          .catch((err) =>
            this.logger.warn(`Failed to write audit log: ${err.message}`),
          );
      }),
    );
  }
}
