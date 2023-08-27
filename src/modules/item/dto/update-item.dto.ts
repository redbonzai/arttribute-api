import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';

export class UpdateItemDto {
  title: string;
  description: string;
  tags: string[];
  author: string;
  source: string;
  license: string[];
}
