import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';
import { EduContentUploadState } from '../enums';

export type BulkLogDocument = HydratedDocument<Bulk>;

@Schema({ timestamps: true, collection: 'bulk_logs' })
export class BulkLog {
  _id: Types.ObjectId;

  // 파일 key
  @Prop({ type: Types.ObjectId })
  bulkId: Types.ObjectId;

  // 파일 key
  @Prop()
  key: string;

  @Prop({ enum: EduContentUploadState, default: EduContentUploadState.PENDING })
  state: string;

  // 오류
  @Prop({})
  error?: string;
}

export const BulkLogSchema = SchemaFactory.createForClass(BulkLog);

export type BulkDocument = HydratedDocument<Bulk>;

// 컨텐츠 엑셀업로드 상태관리 테이블
@Schema({ timestamps: true })
export class Bulk {
  _id: Types.ObjectId;

  // 입력했던 경로
  @Prop()
  path: string;

  // 찾을 파일수
  @Prop()
  filesCount: number;

  // 완료시간
  @Prop({ default: null })
  completeAt: Date;

  @Prop({ default: now() })
  createdAt?: Date;
}

export const BulkSchema = SchemaFactory.createForClass(Bulk);
