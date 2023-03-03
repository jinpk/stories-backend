import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { 
    RecentSeries,
    RecentArticle,
    LevelProgress,
    Statics,
    LevelCompleted,
    CurrentLevel
} from '../dto/edustatus.dto'

export type EduStatusDocument = HydratedDocument<EduStatus>;

@Schema({ timestamps: true })
export class EduStatus {
    @Prop()
    firstLevel: string;

    @Prop()
    currentLevel: CurrentLevel;

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
    levelCompleted: LevelCompleted[];

    @Prop()
    userId: string;

    @Prop({default: now()})
    createdAt?: Date;
}

export const EduStatusSchema = SchemaFactory.createForClass(EduStatus);