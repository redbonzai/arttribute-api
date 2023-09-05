import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class APIKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  private readonly JWT_SECRET = process.env.JWT_SECRET;
  constructor(private authService: AuthService) {
    super(
      {
        header: 'Authorization',
        prefix: 'Bearer ',
      },
      true,
      (apiKey: string, verified: Function, req: Request) => {
        return this.validate(apiKey, verified, req);
      },
    );
  }

  //   authenticate();

  async validate(apiKey: string, verified: Function, req: Request) {
    let error = null;
    let user;
    let info;

    try {
      const project = await this.authService.getProjectForAPIKey(
        this.authService.hash(apiKey),
      );
      (req as any).project = project || null;
      // Change when project works
      user = project || true;
      console.log(user);
    } catch (err) {
      console.log(err);
      error = new UnauthorizedException();
    }
    return verified(error, user, info);
  }
}
