import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserAuthService } from '../../service/auth/user-auth.service';
import type { UserSignUpDto } from './user-auth.dto';

@Controller('user')
export class UserSignUpController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('signup')
  async signUp(@Body() body: UserSignUpDto) {
    console.log('Sign up request:', body);

    if (!body) {
      throw new BadRequestException('Request body is required');
    }

    return this.userAuthService.signUp(body);
  }
}
