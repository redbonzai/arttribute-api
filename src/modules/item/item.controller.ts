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
import { ApiKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators';
import { CreateItemDto, ItemResponse, UpdateItemDto } from './item.dto';
import { ItemService } from './item.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('items')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all items',
    type: [ItemResponse],
  })
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

  @ApiOperation({ summary: 'Get item by id' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved item',
    type: ItemResponse,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  // DEPRECATED
  // @Post('fileupload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.itemService.uploadToWeb3Storage(file);
  // }

  @ApiOperation({ summary: 'Create an item' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created an item',
    type: ItemResponse,
  })
  @ApiResponse({ status: 401, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  //   @UseGuards(JwtAuthGuard)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file',
    type: CreateItemDto,
  })
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() createItem: CreateItemDto,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    // console.log(createItem);
    return this.itemService.create(file, createItem, user, project);
  }

  @ApiOperation({ summary: 'Update an item' })
  @ApiResponse({
    status: 204,
    description: 'Successfully updated an item',
    type: ItemResponse,
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 401, description: 'Forbidden' })
  //   @UseGuards(JwtAuthGuard)
  @UseGuards(ApiKeyAuthGuard)
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

  @ApiOperation({ summary: 'Delete an item' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted an item',
  })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 401, description: 'Forbidden' })
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserPayload) {
    return this.itemService.remove(id, user);
  }
}
