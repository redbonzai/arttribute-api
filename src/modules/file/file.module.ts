import { Module } from '@nestjs/common';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { ItemService } from '../item/item.service';
import { ItemModule } from '../item/item.module';

@Module({
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
