import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body('address') address: string,
    @Body('message') message: string,
    @Body('signature') signature: string,
    @Body('name') name: string,
  ): Promise<{ user }> {
    const user = await this.userService.createUser(
      message,
      signature,
      address,
      name,
    );

    return { user };
  }
}

