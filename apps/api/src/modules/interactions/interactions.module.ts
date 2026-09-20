import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service.js';
import { InteractionsController } from './interactions.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
