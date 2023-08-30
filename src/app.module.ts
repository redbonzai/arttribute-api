import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './modules/payment/payment.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PolybaseModule } from './shared/polybase';
import { ItemModule } from './modules/item/item.module';
import { LicenseModule } from './modules/license/license.module';
import { MulterModule } from '@nestjs/platform-express';
import { UploadModule } from './shared/web3storage/upload.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PolybaseModule,
    CertificateModule,
    PaymentModule,
    ItemModule,
    LicenseModule,
    UploadModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
