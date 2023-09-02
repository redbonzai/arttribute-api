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
import { JwtAuthGuard, User } from '../auth';
import { CreateCertificate } from './certificate.dto';
import { CertificateService } from './certificate.service';

@Controller({ version: '1', path: 'certificates' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async createCertificate(
    @Body() body: CreateCertificate,
    @User() user: JwtPayload,
  ) {
    // By the time it's here, it's already been authorized
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

  @UseGuards(JwtAuthGuard)
  @Get('/:certificateId')
  public async getCertificate(
    @Param('certificateId') certificateId: string,
    @Query('full') full: boolean,
  ) {
    return this.certificateService.getCertificate({ certificateId }, { full });
  }
}
