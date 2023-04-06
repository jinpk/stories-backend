import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type QuizResultDocument = HydratedDocument<QuizResult>;

@Schema({ timestamps: true })
export class QuizResult {
    @Prop()
    userId: string;

    @Prop()
    quizId: string;

    @Prop()
    corrected: boolean;

    @Prop({})
    createdAt?: Date;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);