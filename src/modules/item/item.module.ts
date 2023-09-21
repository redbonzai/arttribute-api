import { Module } from '@nestjs/common';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { UserService } from '../user/user.service';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, UploadService, UserService],
  exports: [ItemService],
})
export class ItemModule {}
