import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}

