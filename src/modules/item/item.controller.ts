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
import { CreateItemDto } from './dto/create-item.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
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
          //replace with UUID
          const uniqueName = Date.now();
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
    return this.itemService.create(createItem, file.destination);
  }

  @Patch(':id')
  @HttpCode(204)
  update(@Param('id') id: string, @Body() updateItem: UpdateItemDto) {
    console.log(updateItem);
    return this.itemService.update(id, updateItem);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
