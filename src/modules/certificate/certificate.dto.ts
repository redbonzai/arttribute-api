import { IsDefined, IsIn, IsString, IsUUID } from 'class-validator';

export class PolybaseCertificate {
  @IsDefined()
  @IsUUID()
  id: string;

  @IsString()
  owner?: string;

  @IsString()
  description?: string;

  @IsString({ each: true })
  reference!: ['item' | 'collection', string];
}

class Reference {
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  @IsDefined()
  @IsUUID()
  id!: string;
}

class Certificate {
  @IsString()
  description?: string;

  reference!: Reference;
}

export class CreateCertificate extends Certificate {
  @IsDefined()
  reference!: Reference;
}

export class UpdateCertificate extends Certificate {}
