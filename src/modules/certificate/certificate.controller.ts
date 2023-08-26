import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificate } from './certificate.dto';

@Controller({ version: '1', path: 'certificate' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post()
  public async createCertificate(@Body() body: CreateCertificate) {
    return this.certificateService.createCertificate({ certificate: body });
  }

  @Get('/:certificateId')
  public async getCertificate(@Param('certificateId') id: string) {
    return this.certificateService.getCertificate({ id });
  }
}
