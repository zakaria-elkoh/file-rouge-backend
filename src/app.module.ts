import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { PhotosModule } from './photos/photos.module';
import { UsersModule } from './users/users.module';
import ChatModule from './chat/chat.module';
import FriendsModule from './friends/friends.module';
import NotificationModule from './notifications/notifications.module';
import AuthModule from './auth/auth.module';
import PostsModule from './posts/posts.module';
import CommentsModule from './comments/comments.module';
import EventsModule from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
    ChatModule,
    EventsModule,
    FriendsModule,
    NotificationModule,
    PhotosModule,
    FriendsModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
