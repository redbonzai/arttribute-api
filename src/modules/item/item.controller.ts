import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyAuthGuard, User, UserPayload } from '../auth';
import { Authentication, Project } from '../auth/decorators';
import { CreateItemDto, ItemResponse, UpdateItemDto } from './item.dto';
import { ItemService } from './item.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@Authentication('any')
@Controller({ version: '1', path: 'items' })
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly userService: UserService,
  ) {}

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

  // @Authentication('any')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() user?: UserPayload,
    @Project() project?: any,
  ) {
    user = await this.userService.populateUser(user, project);
    return this.itemService.findOne(id);
  }

  // DEPRECATED
  // @Post('fileupload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.itemService.uploadToWeb3Storage(file);
  // }

  /************** -------- Not in use anymore ---------**************/
  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // async create(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [new MaxFileSizeValidator({ maxSize: 10000000 })],
  //     }),
  //   )
  //   file: Express.Multer.File,
  //   @Body() createItem: CreateItemDto, //TODO: Should currency input be limited in array?
  //   @User() user: UserPayload,
  //   @Project() project: any,
  // ) {
  //   console.log(user);
  //   return this.itemService.create(file, createItem, user, project);
  // }
  /************** -------- Not in use anymore ---------**************/

  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new collection',
    type: ItemResponse,
  })
  @Post()
  async create(
    @Body() createItem: CreateItemDto, //TODO: Should currency input be limited in array?
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    user = user || (await this.userService.populateUser(user, project));
    return this.itemService.create(createItem, user, project);
  }

  @Patch(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() updateItem: UpdateItemDto,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    user = user || (await this.userService.populateUser(user, project));
    return this.itemService.update(id, updateItem, user, project);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserPayload) {
    return this.itemService.remove(id, user);
  }
}

