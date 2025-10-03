import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AUDIT');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => this.logger.log(`${req.method} ${req.url} by ${user?.email ?? 'anon'} ${Date.now()-start}ms`),
        error: (err) => this.logger.error(`${req.method} ${req.url} by ${user?.email ?? 'anon'} FAILED: ${err.message}`),
      })
    );
  }
}
