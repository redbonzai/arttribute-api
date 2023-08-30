import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificate } from './certificate.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller({ version: '1', path: 'certificate' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post()
  public async createCertificate(@Body() body: CreateCertificate) {
    return this.certificateService.createCertificate({ certificate: body });
  }

  @UseGuards(AuthGuard('jwt'))
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
