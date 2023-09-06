import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  IsDefined,
  IsIn,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';

class Reference {
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  @IsDefined()
  @IsUUID()
  id!: string;
}

export class CreateRequest {
  @IsString()
  senderNote?: string;

  @IsDefined()
  reference!: Reference;
}

export class UpdateRequest {
  @IsNotEmpty()
  accepted: boolean;

  @IsString()
  receiverNote: string;

  @IsNotEmpty()
  @IsString()
  senderNote: string;
}

