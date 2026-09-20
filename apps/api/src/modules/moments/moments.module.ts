import { Module } from '@nestjs/common';
import { MomentsService } from './moments.service.js';
import { MomentsController } from './moments.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [MomentsController],
  providers: [MomentsService],
  exports: [MomentsService],
})
export class MomentsModule {}
