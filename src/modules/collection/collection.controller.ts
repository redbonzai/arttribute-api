import { Controller, Post, Body } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollection } from './collection.model';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  public async createCollection(@Body() createCollectionDto: CreateCollection) {
    return await this.collectionService.createCollection(createCollectionDto);
  }
}
