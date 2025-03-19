import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationsController from './notifications.controller';
import NotificationService from './notifications.service';
import FriendsModule from '../friends/friends.module';
import { NotificationSchema } from './notification.schema';

@Module({
  imports: [
    forwardRef(() => FriendsModule),
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export default class NotificationModule {}
