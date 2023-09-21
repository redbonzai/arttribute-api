import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { APIKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { CreateCertificate } from './certificate.dto';
import { CertificateService } from './certificate.service';
import { Project, Auth } from '../auth/decorators';

@Controller({ version: '1', path: 'certificates' })
export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  public async createCertificate(
    @Body() body: CreateCertificate,
    @User() user: UserPayload,
  ) {
    return await this.certificateService.createCertificate({
      certificate: body,
      user,
    });
  }

  @Get()
  public async getCertificates(@Query('full') full: boolean) {
    return this.certificateService.getCertificates({}, { full });
  }

  @Get(':slug')
  public async getCertificateBySlug(@Param('slug') slug: string) {
    return this.certificateService.getCertificateBySlug({ slug });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/mint/:certificateId')
  public async mintCertificate(
    @Param('certificateId') certificateId: string,
    @Body('message') message: string,
    @Body('signature') signature: string,
    @User() user: UserPayload,
  ) {
    return this.certificateService.mintCertificate(
      { certificateId },
      message,
      signature,
      user,
    );
  }

  @Auth('api-key')
  @Get('/:certificateId')
  public async getCertificate(
    @Param('certificateId') certificateId: string,
    @Query('full') full: boolean,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    console.log({ user, project });
    return this.certificateService.getCertificate({ certificateId }, { full });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userId/references') // TODO: This route structure?
  public async discoverUserCertificates(
    @Param('userId') userId: string,
    @Query('full') full: boolean,
  ) {
    return this.certificateService.discoverUserCertificates(
      { userId },
      { full },
    );
  }
}
