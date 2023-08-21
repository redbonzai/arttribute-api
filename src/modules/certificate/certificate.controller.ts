import { Controller, Get, Param, Post } from '@nestjs/common';
import { CertificateService } from './certificate.service';

@Controller({ version: '1', path: 'certificate' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @Post()
  public async createCertificate() {
    return this.certificateService.createCertificate({});
  }

  @Get('/:certificateId')
  public async getCertificate(@Param('certificateId') id: string) {
    return this.certificateService.getCertificate({ id });
  }
}
