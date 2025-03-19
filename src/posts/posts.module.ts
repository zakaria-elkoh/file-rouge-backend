import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import PostsController from '../posts/posts.controller';
import { PostSchema } from './post.schema';
import CommentsService from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { UsersModule } from '../users/users.module';
import FriendsModule from '../friends/friends.module';
import { PhotosModule } from '../photos/photos.module';
import NotificationModule from '../notifications/notifications.module';
import CommentsModule from '../comments/comments.module';

@Module({
  imports: [
    UsersModule,
    FriendsModule,
    PhotosModule,
    NotificationModule,
    MongooseModule.forFeatureAsync([
      {
        name: 'Post',
        imports: [CommentsModule],
        useFactory: (commentsService: CommentsService) => {
          const schema = PostSchema;
          schema.post('deleteOne', (post) => {
            commentsService.cascadeDeleteComments(post._id);
          });
          return schema;
        },
        inject: [CommentsService],
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [MongooseModule, PostsService],
})
export default class PostsModule {}
