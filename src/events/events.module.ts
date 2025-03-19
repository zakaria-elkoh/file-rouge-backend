import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [UsersModule],
  providers: [EventsGateway],
})
export default class EventsModule {}
