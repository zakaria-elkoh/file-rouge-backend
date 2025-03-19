import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { UserType } from '../users/user.schema';

export type CommentType = Comment & Document;

@Schema({ timestamps: true, validateBeforeSave: true })
export class Comment {
  @Prop()
  id!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  postId!: string;

  @Prop({ required: true })
  text!: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes!: UserType[];
}
export const CommentSchema = SchemaFactory.createForClass(Comment);
