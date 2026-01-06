import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { UserAuthController } from './controllers/user/user-auth.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { UserAuthService } from './service/auth/user-auth.service';

@Module({
  imports: [],
  controllers: [AppController, UserAuthController],
  providers: [AppService, DatabaseService, UserAuthService],
})
export class AppModule {}
