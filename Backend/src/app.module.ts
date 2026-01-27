import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { UserAuthController } from './controllers/user/user-auth.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { UserAuthService } from './service/auth/user-auth.service';
import { SettingsController } from './controllers/settings/settings.controller';
import { BrevoService } from './service/email/brevo.service';
import { AuthenticationController } from './controllers/settings/authentication.controller';
import { CameraLogsController } from './controllers/stats/camera-logs.controller';
import { FertilizerAnalyticsController } from './controllers/stats/fertilizer-analytics.controller';
import { ModuleAnalyticsController } from './controllers/stats/module-analytics.controller';
import { TrashLogsController } from './controllers/stats/trash-logs.controller';
import { IprogSmsService } from './service/iprogsms/iprogsms.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    UserAuthController,
    SettingsController,
    AuthenticationController,
    CameraLogsController,
    FertilizerAnalyticsController,
    ModuleAnalyticsController,
    TrashLogsController,
  ],
  providers: [
    AppService,
    DatabaseService,
    UserAuthService,
    BrevoService,
    IprogSmsService,
  ],
})
export class AppModule {}
