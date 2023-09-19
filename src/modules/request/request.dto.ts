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
  /**
   * @example "item"
   */
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  /**
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsDefined()
  @IsUUID()
  id!: string;
}

export class CreateRequest {
  /**
   * The note from the sender
   * @example "Accept this request"
   */
  @IsString()
  senderNote?: string;

  /**
   * Reference to the item or collection
   */
  @IsDefined()
  reference!: Reference;
}

export class UpdateRequest {
  /**
   * Whether or not the request has been accepted
   * @example true
   */
  @IsNotEmpty()
  accepted: boolean;

  /**
   * The note from the receiver
   * @example "I accept this request"
   */
  @IsString()
  receiverNote: string;

  /**
   * The note from the sender
   * @example "Accept this request"
   */
  @IsNotEmpty()
  @IsString()
  senderNote: string;
}
