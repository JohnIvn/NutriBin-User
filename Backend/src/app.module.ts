import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './controllers/app.controller';
import { UserAuthController } from './controllers/user/user-auth.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { AuthenticationController } from './controllers/settings/authentication.controller';
import { CameraLogsController } from './controllers/stats/camera-logs.controller';
import { FertilizerAnalyticsController } from './controllers/stats/fertilizer-analytics.controller';
import { ModuleAnalyticsController } from './controllers/stats/module-analytics.controller';
import { TrashLogsController } from './controllers/stats/trash-logs.controller';
import { DashboardController } from './controllers/stats/dashboard.controller';
import { AnnouncementsController } from './controllers/settings/announcements.controller';

import { AppService } from './service/app.service';
import { DatabaseService } from './service/database/database.service';
import { UserAuthService } from './service/auth/user-auth.service';
import { BrevoService } from './service/email/brevo.service';
import { IprogSmsService } from './service/iprogsms/iprogsms.service';
import { VideoStreamGateway } from './service/video/video-stream.gateway';
import { MachineController } from './controllers/machine/machine.controller';
import { MachineService } from './service/machine/machine.service';
import { MobileController } from './controllers/mobile/mobile.controller';
import { MobileService } from './service/mobile/mobile.service';
import { MachineNotificationsModule } from './service/notification/machine-notifications.module';
import { DataScienceController } from './controllers/stats/data-science.controller';

@Module({
  imports: [
    MachineNotificationsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [
    AppController,
    UserAuthController,
    SettingsController,
    AuthenticationController,
    CameraLogsController,
    FertilizerAnalyticsController,
    ModuleAnalyticsController,
    TrashLogsController,
    DashboardController,
    AnnouncementsController,
    MachineController,
    MobileController,
    DataScienceController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    DatabaseService,
    UserAuthService,
    BrevoService,
    IprogSmsService,
    VideoStreamGateway,
    MachineService,
    MobileService,
  ],
})
export class AppModule {}
