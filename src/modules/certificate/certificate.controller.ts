import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { APIKeyAuthGuard, User } from '../auth';
import { CreateCertificate } from './certificate.dto';
import { CertificateService } from './certificate.service';

@Controller({ version: '1', path: 'certificates' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post()
  public async createCertificate(
    @Body() body: CreateCertificate,
    // @User() user: JwtPayload,
  ) {
    const user = { sub: 'test-user' };
    console.log(user);
    return this.certificateService.createCertificate({
      certificate: body,
      user,
    });
  }

  @Get()
  public async getCertificates(@Query('full') full: boolean) {
    return this.certificateService.getCertificates({}, { full });
  }

  @UseGuards(APIKeyAuthGuard)
  @Get('/:certificateId')
  public async getCertificate(
    @Param('certificateId') certificateId: string,
    @Query('full') full: boolean,
  ) {
    return this.certificateService.getCertificate({ certificateId }, { full });
  }
}
