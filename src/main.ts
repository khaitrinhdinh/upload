import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { join } from 'path';
// import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(
  //   session({
  //     secret: 'your-secret-key',
  //     resave: false,
  //     saveUninitialized: false,
  //   }),
  // );
  // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  //   prefix: '/uploads/',
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
