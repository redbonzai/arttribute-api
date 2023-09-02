import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, UploadService, UserService],
})
export class ItemModule {}
