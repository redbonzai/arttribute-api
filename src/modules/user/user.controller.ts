import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller({ version: '1', path: 'users' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
