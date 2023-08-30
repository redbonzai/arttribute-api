import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard, User } from '../auth';
import { CreateCertificate } from './certificate.dto';
import { CertificateService } from './certificate.service';

@Controller({ version: '1', path: 'certificate' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post()
  public async createCertificate(@Body() body: CreateCertificate) {
    return this.certificateService.createCertificate({ certificate: body });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:certificateId')
  public async getCertificate(
    @Param('certificateId') id: string,
    @User() user: JwtPayload,
    @Request() req,
  ) {
    console.log(req.user);
    return this.certificateService.getCertificate({ id });
  }
}
