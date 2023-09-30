import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
<<<<<<< HEAD
import { APIKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators/project.decorator';
import { CreateItemDto, ItemResponse, UpdateItemDto } from './item.dto';
=======
import { ApiKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators';
import { CreateItemDto, UpdateItemDto } from './item.dto';
>>>>>>> 5f857e222eb79f7707bee208763ccf2ae522202b
import { ItemService } from './item.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

//@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll(
    @Query()
    query: {
      source?: string;
      tags?: string;
    },
  ) {
    return this.itemService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  // DEPRECATED
  @Post('fileupload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.itemService.uploadToWeb3Storage(file);
  }

<<<<<<< HEAD
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new collection',
    type: ItemResponse,
  })
  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
=======
  //   @UseGuards(JwtAuthGuard)
  @UseGuards(ApiKeyAuthGuard)
>>>>>>> 5f857e222eb79f7707bee208763ccf2ae522202b
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body('data') createItem: string,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    const data = JSON.parse(createItem);
    return this.itemService.create(file, data, user, project);
  }

<<<<<<< HEAD
  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
=======
  //   @UseGuards(JwtAuthGuard)
  @UseGuards(ApiKeyAuthGuard)
>>>>>>> 5f857e222eb79f7707bee208763ccf2ae522202b
  @Patch(':id')
  @HttpCode(204)
  update(
    @Param('id') id: string,
    @Body() updateItem: UpdateItemDto,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    return this.itemService.update(id, updateItem, user, project);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserPayload) {
    return this.itemService.remove(id, user);
  }
}

