import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './exception-filters/mongo.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalFilters(new MongoExceptionFilter());
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(process.env.PORT ?? 4000, () => {
    console.log(`Server running on port ${process.env.PORT ?? 4000}`);
  });
}
bootstrap();