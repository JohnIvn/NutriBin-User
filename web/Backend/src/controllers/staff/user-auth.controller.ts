import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserAuthService } from '../../service/auth/user-auth.service';
import type { UserSignInDto, UserSignUpDto } from './user-auth.dto';

@Controller('user')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('signup')
  async signUp(@Body() body: UserSignUpDto) {
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
}
