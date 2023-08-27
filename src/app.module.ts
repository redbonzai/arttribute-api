import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './modules/payment/payment.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PolybaseModule } from './shared/polybase';
import { ItemModule } from './modules/item/item.module';
import { LicenseModule } from './modules/license/license.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    CertificateModule,
    PaymentModule,
    PolybaseModule,
    ItemModule,
    LicenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
