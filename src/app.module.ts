import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemModule } from './modules/item/item.module';
import { LicenseModule } from './modules/license/license.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [ItemModule, LicenseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
