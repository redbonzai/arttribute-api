import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { KeyService } from './key.service';
import { KeyDto } from './key.dto';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller('key')
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createKey(@Body() keyDto: KeyDto, @User() user: JwtPayload) {
    const userId = user.publicKey;
    const keyData = await this.keyService.createKey(keyDto, userId);
    const createKeyResult = {
      message: 'Key created successfully',
      apiKey: keyData.apikey,
      note: 'Please save this key, it will not be shown again.',
      details: {
        associatedName: keyDto.name,
        associatedUrl: keyDto.url,
      },
    };
    return createKeyResult;
  }
}

