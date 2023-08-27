export class UpdateItem {
  title: string;
  description: string;
  tags: string[];
  author: string;
  source: string;
  license: string[];
}

export class CreateItemDto extends UpdateItem {
  owner: string;
}
