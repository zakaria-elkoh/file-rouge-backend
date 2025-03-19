import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import FriendsController from './friends.controller';
import FriendRequestSchema from './friendRequest.schema';
import FriendsService from './friends.service';
import { UsersModule } from '../users/users.module';
import NotificationModule from '../notifications/notifications.module';
import FriendshipSchema from './friendship.schema';

@Module({
  imports: [
    forwardRef(() => NotificationModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: 'FriendRequest', schema: FriendRequestSchema },
      { name: 'Friendship', schema: FriendshipSchema },
    ]),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export default class FriendsModule {}
