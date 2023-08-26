import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PolybaseModule } from './shared/polybase';

@Module({
  imports: [CertificateModule, PolybaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
