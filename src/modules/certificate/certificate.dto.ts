import {
  IsDefined,
  IsIn,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class Reference {
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  @IsDefined()
  @IsUUID()
  id!: string;
}

export class PolybaseCertificate {
  @IsDefined()
  @IsUUID()
  id: string;

  @IsString()
  owner?: string;

  @IsString()
  description?: string;

  @IsDefined()
  @ValidateNested()
  reference!: Reference;
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
