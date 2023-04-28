import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type QuizResultDocument = HydratedDocument<QuizResult>;

@Schema({ timestamps: true })
export class QuizResult {
    @Prop()
    userId: Types.ObjectId;

    @Prop()
    quizId: Types.ObjectId;

    @Prop()
    corrected: boolean;

    @Prop()
    createdAt?: Date;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);