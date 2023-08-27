import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemService } from './item.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { generateUniqueId } from '~/shared/util/generateUniqueId';

@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = generateUniqueId();
          const extension = extname(file.originalname);
          const filename = `${uniqueName}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  create(
    //Pipe to limit the file size of uploaded file to 10 MB
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() createItem: CreateItemDto,
  ) {
    const filePath = file.destination + '/' + file.originalname;
    return this.itemService.create(createItem, file);
  }

  @Patch(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() updateItem: UpdateItemDto) {
    return this.itemService.update(id, updateItem);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
