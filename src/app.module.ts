import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './modules/payment/payment.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PolybaseModule } from './shared/polybase';

@Module({
  imports: [CertificateModule, PaymentModule, PolybaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

