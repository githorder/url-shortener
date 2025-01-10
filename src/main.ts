import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as hbs from 'hbs';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'index' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
