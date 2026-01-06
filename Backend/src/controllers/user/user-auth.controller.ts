import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserAuthService } from '../../service/auth/user-auth.service';
import type { UserSignInDto, UserSignUpDto } from './user-auth.dto';

@Controller('user')
export class UserAuthController {
  constructor(private readonly staffAuthService: UserAuthService) {}

  @Post('signup')
  async signUp(@Body() body: UserSignUpDto) {
    console.log(body);
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.staffAuthService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: UserSignInDto) {
    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.staffAuthService.signIn(body);
  }
}
