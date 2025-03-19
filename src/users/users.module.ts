import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UserSchema } from './user.schema';
import UsersService from './users.service';
import { PhotosModule } from '../photos/photos.module';
import FriendsModule from '../friends/friends.module';

@Module({
  imports: [
    PhotosModule,
    forwardRef(() => FriendsModule),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
