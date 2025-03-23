import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type VerificationRequestType = VerificationRequest & Document;

export enum VerificationRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class VerificationRequest {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ 
    default: VerificationRequestStatus.PENDING,
    enum: Object.values(VerificationRequestStatus),
  })
  status!: string;

  @Prop()
  adminResponse?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const VerificationRequestSchema = SchemaFactory.createForClass(VerificationRequest); 