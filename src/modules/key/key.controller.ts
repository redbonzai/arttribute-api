import { Controller, Get, Body, UseGuards, Param } from '@nestjs/common';
import { KeyService } from './key.service';
import { KeyDto } from './key.dto';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller({ version: '1', path: 'key' })
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async createKey(@Param('id') projectId: string, @User() user: JwtPayload) {
    const userId = user.publicKey;
    const keyData = await this.keyService.createKey(userId, projectId);
    const createKeyResult = {
      message: 'Key created successfully',
      apiKey: keyData.apikey,
      note: 'Please save this key, it will not be shown again.',
    };
    return createKeyResult;
  }
}

