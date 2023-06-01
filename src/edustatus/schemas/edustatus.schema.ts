import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type EduStatusDocument = HydratedDocument<EduStatus>;

@Schema({ timestamps: true })
export class EduStatus {
    _id?: Types.ObjectId

    @Prop()
    firstLevel: string;

    @Prop()
    latestLevel: string;

    @Prop()
    selectedLevel: string;

    @Prop()
    recentArticleId: Types.ObjectId;

    @Prop()
    recentSeriesId: Types.ObjectId;

    @Prop()
    userId: Types.ObjectId;

    @Prop({})
    createdAt?: Date;
}

export const EduStatusSchema = SchemaFactory.createForClass(EduStatus);