import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { UploadService } from 'src/shared/web3storage/upload.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, UploadService],
})
export class ItemModule {}
