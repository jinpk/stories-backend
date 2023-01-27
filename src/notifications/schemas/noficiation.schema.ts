import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { NotificationContexts } from '../enums';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ enum: NotificationContexts, default: NotificationContexts.ALL })
  @ApiProperty({ description: '알림종류', enum: NotificationContexts })
  context: NotificationContexts;

  @Prop()
  @ApiProperty({ description: '발송날짜' })
  @IsDate()
  @IsNotEmpty()
  sendAt: Date;

  @Prop({})
  @ApiProperty({ description: 'Image Path', required: false })
  imagePath: string;

  @Prop({})
  @ApiProperty({ description: '알림제목' })
  title: string;

  @Prop({})
  @ApiProperty({ description: '알림내용' })
  message: string;

  @Prop({ default: false })
  deleted: boolean;
  @Prop({ default: null })
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
