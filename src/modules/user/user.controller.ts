import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createUser(
    @Body('address') address: string,
    @Body('message') message: string,
    @Body('signature') signature: string,
    @Body('name') name: string,
  ): Promise<{ message: string; user; token: string }> {
    const { token, publicKey } = await this.authService.authenticate(
      address,
      message,
      signature,
    );

    if (!token) {
      throw new UnauthorizedException('Could not authenticate user');
    }

    const user = await this.userService.createUser(publicKey, address, name);

    return { ...user, token };
  }
}
