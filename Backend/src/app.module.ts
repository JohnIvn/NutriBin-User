import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { UserAuthController } from './controllers/user/user-auth.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { UserAuthService } from './service/auth/user-auth.service';
import { SettingsController } from './controllers/settings/settings.controller';
import { BrevoService } from './service/email/brevo.service';
import { AuthenticationController } from './controllers/settings/authentication.controller';

@Module({
  imports: [],
  controllers: [AppController, UserAuthController, SettingsController, AuthenticationController],
  providers: [AppService, DatabaseService, UserAuthService, BrevoService],
})
export class AppModule {}
