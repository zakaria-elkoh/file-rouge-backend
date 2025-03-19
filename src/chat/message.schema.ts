import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserType } from '../users/user.schema';

export type MessageType = Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: UserType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  chatId!: string;

  @Prop({ required: true })
  text!: string;

  @Prop()
  createdAt!: number;

  @Prop()
  updatedAt!: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
