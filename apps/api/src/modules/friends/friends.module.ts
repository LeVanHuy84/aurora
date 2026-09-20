import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service.js';
import { FriendsController } from './friends.controller.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
