import { IsDefined, IsString } from 'class-validator';

class Certificate {
  @IsString()
  description?: string;

  @IsString({ each: true })
  reference!: string[];
}

export class CreateCertificate extends Certificate {
  @IsDefined()
  reference: string[];
}

export class UpdateCertificate extends Certificate {}
