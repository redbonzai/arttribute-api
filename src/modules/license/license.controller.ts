import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseModel } from './license.dto';
import { JwtAuthGuard } from '../auth';

@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'licenses' })
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get()
  findAll() {
    return this.licenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @Post()
  create(@Body() createLicense: LicenseModel) {
    return this.licenseService.create(createLicense);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLicense: LicenseModel) {
    return this.licenseService.update();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenseService.remove(id);
  }
}
