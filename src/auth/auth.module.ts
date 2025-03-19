import { Module } from '@nestjs/common';
import AuthController from '../auth/auth.controller';
import AuthService from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import FriendsModule from '../friends/friends.module';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, FriendsModule],
  providers: [AuthService],
})
export default class AuthModule {}
