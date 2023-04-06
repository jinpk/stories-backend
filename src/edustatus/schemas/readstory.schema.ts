import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type ReadStoryDocument = HydratedDocument<ReadStory>;

@Schema({ timestamps: true })
export class ReadStory {
    @Prop()
    userId: string;

    @Prop()
    eduContentsId: string;

    @Prop()
    contentsSerialNum: string;

    @Prop({})
    createdAt?: Date;
}

export const ReadStorySchema = SchemaFactory.createForClass(ReadStory);