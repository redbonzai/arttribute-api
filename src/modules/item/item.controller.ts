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
import { ItemService } from './item.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { APIKeyAuthGuard, JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';
import { Project } from '../auth/decorators/project.decorator';
import { PolybaseProject } from '../project/project.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post('fileupload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.itemService.uploadToWeb3Storage(file);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
  @Post()
  create(
    @Body() createItem: CreateItemDto,
    @User() user: JwtPayload,
    @Project() project: any,
  ) {
    return this.itemService.create(createItem, user, project);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
  @Patch(':id')
  @HttpCode(204)
  update(
    @Param('id') id: string,
    @Body() updateItem: UpdateItemDto,
    @User() user: JwtPayload,
    @Project() project: any,
  ) {
    return this.itemService.update(id, updateItem, user, project);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: JwtPayload) {
    return this.itemService.remove(id, user);
  }
}

