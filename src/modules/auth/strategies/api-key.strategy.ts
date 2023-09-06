import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';
import { trim } from 'lodash';

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
        return this.validate(trim(apiKey), verified, req);
      },
    );
  }

  //   authenticate();

  async validate(apiKey: string, verified: Function, req: Request) {
    let error = null;
    let project;
    let info;

    try {
      project = await this.authService.getProjectForAPIKey(
        this.authService.hash(apiKey),
      );
      (req as any).project = project || null;
      console.log(project);
    } catch (err) {
      console.log(err);
      error = new UnauthorizedException();
    }
    return verified(error, project, info);
  }
}
