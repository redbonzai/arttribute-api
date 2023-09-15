import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { CollectionModule } from '../collection/collection.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [CollectionModule, ItemModule],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
