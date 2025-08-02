import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { formatDate } from './date-format.util';

@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler):  Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.formatDates(data);
      }),
    );
  }

  private formatDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.formatDates(item));
    } else if (data && typeof data === 'object') {
      for (const key in data) {
        if (data[key] instanceof Date) {
          data[key] = formatDate(data[key]);
        } else if (typeof data[key] === 'object') {
          data[key] = this.formatDates(data[key]);
        }
      }
    }
    return data;
  }
}