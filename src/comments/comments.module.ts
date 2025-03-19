import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import CommentsController from '../comments/comments.controller';
import { CommentSchema } from './comment.schema';
import CommentsService from '../comments/comments.service';
import { UsersModule } from '../users/users.module';
import NotificationModule from '../notifications/notifications.module';
import PostsModule from '../posts/posts.module';

@Module({
  imports: [
    UsersModule,
    NotificationModule,
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [MongooseModule, CommentsService],
})
export default class CommentsModule {}
