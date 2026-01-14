import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserAuthService } from '../../service/auth/user-auth.service';
import type { UserSignInDto, UserSignUpDto, GoogleSignInDto } from './user-auth.dto';

@Controller('user')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('signup')
  async signUp(@Body() body: UserSignUpDto) {
    console.log(body);
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: UserSignInDto) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.signIn(body);
  }

  @Post('google-signin')
  async googleSignIn(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.userAuthService.googleSignIn(body.credential);
  }

  @Post('google-signup')
  async googleSignUp(@Body() body: GoogleSignInDto) {
    if (!body || !body.credential) {
      throw new BadRequestException('Google credential is required');
    }

    return this.userAuthService.googleSignUp(body.credential);
  }
}
