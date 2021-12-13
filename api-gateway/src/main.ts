import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { format, zonedTimeToUtc } from 'date-fns-tz';

import { AllExceptionsFilter } from './common/filters/http-excepetion.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeOutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TimeOutInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  Date.prototype.toJSON = function (): any {
    const date = zonedTimeToUtc(this, 'America/Sao_Paulo');
    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", {
      timeZone: 'America/Sao_Paulo',
    });
    return formattedDate;
  };

  await app.listen(3000);
}
bootstrap();
