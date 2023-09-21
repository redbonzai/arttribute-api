import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { APIKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll(
    @Req() req,
    @Query()
    query: { source?: string; tags?: string },
  ) {
    return this.itemService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
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
    @User() user: JwtPayload,
  ) {
    const filePath = file.destination + '/' + file.originalname;
    return this.itemService.create(createItem, file, user);
  }

  @Patch(':id')
  @HttpCode(204)
  update(
    @Param('id') id: string,
    @Body() updateItem: UpdateItemDto,
    @User() user: JwtPayload,
  ) {
    return this.itemService.update(id, updateItem, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: JwtPayload) {
    return this.itemService.remove(id, user);
  }
}
