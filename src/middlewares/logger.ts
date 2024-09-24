import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const now = Date.now();

    this.logger.log(`Entering... ${className}.${handlerName}`);
    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `Exiting... ${className}.${handlerName} ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
