import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { 
    RecentSeries,
    RecentArticle,
    LevelProgress,
    Statics,
    LevelCompleteRate
} from '../dto/edustatus.dto'

export type EduStatusDocument = HydratedDocument<EduStatus>;

@Schema({ timestamps: true })
export class EduStatus {
    @Prop()
    firstLevel: string;

    @Prop()
    highestLevel: string;

    @Prop()
    selectedLevel: string;

    @Prop()
    levelProgress: LevelProgress[];

    @Prop()
    recentSeries: RecentSeries;

    @Prop()
    recentArticle: RecentArticle;

    @Prop({default: {}})
    statics: Statics;

    @Prop()
    levelCompleteRate: LevelCompleteRate[];

    @Prop()
    userId: string;

    @Prop({default: now()})
    createdAt?: Date;
}

export const EduStatusSchema = SchemaFactory.createForClass(EduStatus);