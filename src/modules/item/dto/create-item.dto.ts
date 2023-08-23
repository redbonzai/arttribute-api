import { LicenseModel } from 'src/modules/license/models/license.model';

export class CreateItemDto {
  title: string;
  description: string;
  tags: string[];
  author: string;
  owner: string;
  source: string;
  license: string[];
  created: string;
  updated: string;
}
