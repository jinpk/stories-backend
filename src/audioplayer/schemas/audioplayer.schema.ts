import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type AudioPlayerDocument = HydratedDocument<AudioPlayer>;

@Schema({ timestamps: true })
export class AudioPlayer {
  @Prop()
  completed: string;

  @Prop({default: now()})
  createdAt?: Date;
}

export const AudioPlayerSchema = SchemaFactory.createForClass(AudioPlayer);
