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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller({ version: '1', path: 'licenses' })
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @ApiOperation({ summary: 'Get all licenses' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all licenses',
    type: [LicenseModel],
  })
  @Get()
  findAll() {
    return this.licenseService.findAll();
  }

  @ApiOperation({ summary: 'Get a license by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a license',
    type: LicenseModel,
  })
  @ApiResponse({ status: 404, description: 'License not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new license' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new license',
    type: LicenseModel,
  })
  @Post()
  create(@Body() createLicense: LicenseModel) {
    return this.licenseService.create(createLicense);
  }

  @ApiOperation({ summary: 'Update a license' })
  @Patch(':id')
  // TODO: do something here
  update(@Param('id') id: string, @Body() updateLicense: LicenseModel) {
    return this.licenseService.update();
  }

  @ApiOperation({ summary: 'Delete a license' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted a license',
  })
  @ApiResponse({ status: 404, description: 'License not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.licenseService.remove(id);
  }
}

