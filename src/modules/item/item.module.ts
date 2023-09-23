import { Module } from '@nestjs/common';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { UserService } from '../user/user.service';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { FileService } from '../file/file.service';

@Module({
  controllers: [ItemController],
  providers: [ItemService, UploadService, UserService, FileService],
  exports: [ItemService],
})
export class ItemModule {}
