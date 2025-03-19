import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ChatController from './chat.controller';
import MessagesController from './messages.controller';
import { ChatSchema } from './chat.schema';
import { MessageSchema } from './message.schema';
import ChatService from './chat.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema },
      { name: 'Chat', schema: ChatSchema },
    ]),
  ],
  providers: [ChatService],
  exports: [MongooseModule, ChatService],
  controllers: [ChatController, MessagesController],
})
export default class ChatModule {}
