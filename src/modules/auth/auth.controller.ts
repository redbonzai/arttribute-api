import {
  Body,
  Controller,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { User } from './decorators';
import { JwtAuthGuard } from './guards';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async verifySignature(
    @Body('address') address: string,
    @Body('message') message: string,
    @Body('signature') signature: string,
  ): Promise<{ token: string }> {
    const verifiedUser = await this.authService.authenticate(
      address,
      message,
      signature,
    );
    const token = verifiedUser.token;
    if (!token) {
      throw new UnauthorizedException('Authentication failed');
    }

    return { token: token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('api-key/:id')
  async createAPIKey(@Param('id') projectId: string, @User() user: JwtPayload) {
    const userId = user.publicKey;
    const keyData = await this.authService.createKey(userId, projectId);
    const createKeyResult = {
      message: 'Key created successfully',
      apiKey: keyData.apikey,
      note: 'Please save this key, it will not be shown again.',
    };
    return createKeyResult;
  }
}
