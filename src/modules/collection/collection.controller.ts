import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollection } from './collection.model';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async createCollection(@Body() createCollectionDto: CreateCollection) {
    return await this.collectionService.createCollection(createCollectionDto);
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
  async addItemToCollection(
    @Param('id') collectionId: string,
    @Body('itemId') itemId: string,
  ) {
    return await this.collectionService.addItemToCollection(
      collectionId,
      itemId,
    );
  }
}
