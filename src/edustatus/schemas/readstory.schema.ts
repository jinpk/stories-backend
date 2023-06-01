import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type ReadStoryDocument = HydratedDocument<ReadStory>;

@Schema({ timestamps: true })
export class ReadStory {
    _id?: Types.ObjectId;

    @Prop()
    userId: Types.ObjectId;

    @Prop()
    level: string;

    @Prop()
    eduContentsId: Types.ObjectId;

    @Prop()
    contentsSerialNum: string;

    @Prop({default: false})
    completed?: boolean;

    @Prop({})
    lastReadAt: Date;

    @Prop({})
    createdAt?: Date;
}

export const ReadStorySchema = SchemaFactory.createForClass(ReadStory);