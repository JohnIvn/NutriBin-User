import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { UserAuthController } from './controllers/user/user-auth.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { UserAuthService } from './service/auth/user-auth.service';
import { NodemailerService } from './service/email/nodemailer.service';
import { SettingsController } from './controllers/settings/settings.controller';

@Module({
  imports: [],
  controllers: [AppController, UserAuthController, SettingsController],
  providers: [AppService, DatabaseService, UserAuthService, NodemailerService],
})
export class AppModule {}
