import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollection } from './collection.dto';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'collections' })
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async createCollection(
    @Body() createCollectionDto: CreateCollection,
    @User() user: JwtPayload,
  ) {
    return await this.collectionService.createCollection(
      createCollectionDto,
      user,
    );
  }

  @Get()
  async getAllCollections() {
    return await this.collectionService.getAllCollections();
  }

  @Get('user/:id') // TODO: change when user feature and auth is implemented [expected: /users/{userId}/collections)]
  async getCollectionsForUser(@Param('id') userId: string) {
    return await this.collectionService.getCollectionsForUser(userId);
  }

  @Get(':id')
  async getCollection(@Param('id') collectionId: string) {
    return await this.collectionService.getCollection(collectionId);
  }

  @Patch(':id')
  async changeVisibility(
    @Param('id') collectionId: string,
    @Body('isPublic') isPublic: boolean,
    @User() user: JwtPayload,
  ) {
    return await this.collectionService.changeVisibility(
      collectionId,
      isPublic,
      user,
    );
  }

  // TODO: check on the API structure for adding and removing items from a collection
  @Patch(':id/items')
  async addItemToCollection(
    @Param('id') collectionId: string,
    @Body('itemId') itemId: string,
    @User() user: JwtPayload,
  ) {
    return await this.collectionService.addItemToCollection(
      collectionId,
      itemId,
      user,
    );
  }

  @Delete(':id/items/:itemId')
  async removeItemFromCollection(
    @Param('id') collectionId: string,
    @Param('itemId') itemId: string,
    @User() user: JwtPayload,
  ) {
    return await this.collectionService.removeItemFromCollection(
      collectionId,
      itemId,
      user,
    );
  }

  @Delete(':id')
  async deleteCollection(
    @Param('id') collectionId: string,
    @User() user: JwtPayload,
  ) {
    return await this.collectionService.deleteCollection(collectionId, user);
  }
}
