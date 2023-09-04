import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { inspect } from 'util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      skipMissingProperties: true,
      exceptionFactory: (errors) => {
        // console.log(errors);
        for (const error of errors) {
          console.log(
            inspect(error, {
              showHidden: false,
              depth: null,
              colors: true,
            }),
          );
        }
        return new BadRequestException(errors);
      },
    }),
  );
  //cors
  app.enableCors();
  await app.listen(5000);
}
bootstrap();

