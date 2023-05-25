import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type StudiedDateDocument = HydratedDocument<StudiedDate>;

@Schema({ timestamps: true })
export class StudiedDate {
    @Prop()
    userId: Types.ObjectId;

    @Prop()
    dayStr: string;
}

export const StudiedDateSchema = SchemaFactory.createForClass(StudiedDate);