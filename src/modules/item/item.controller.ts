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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemService } from './item.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fileupload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.itemService.uploadToWeb3Storage(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createItem: CreateItemDto, @User() user: JwtPayload) {
    console.log('user:', user);
    const userId = user.publicKey;
    return this.itemService.create(createItem, userId);
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
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}

