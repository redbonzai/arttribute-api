import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';
import { trim } from 'lodash';

type VerifiedCallback = (err: any, user: any, info?: any) => void;

@Injectable()
export class APIKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  private readonly JWT_SECRET = process.env.JWT_SECRET;
  constructor(private authService: AuthService) {
    super(
      {
        header: 'ProjectAuthorization',
        prefix: 'Bearer ',
      },
      true,
      (apiKey: string, verified: VerifiedCallback, req: Request) => {
        return this.validate(trim(apiKey), verified, req);
      },
    );
  }

  //   authenticate();

  async validate(apiKey: string, verified: VerifiedCallback, req: Request) {
    let error = null;
    let project;
    let info;

    try {
      project = await this.authService.getProjectForAPIKey(
        this.authService.hash(apiKey),
      );
      (req as any).project = project || null;
    } catch (err) {
      console.log(err);
      error = new UnauthorizedException();
    }
    return verified(error, project, info);
  }
}
