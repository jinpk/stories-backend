import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VerifiDocument = HydratedDocument<Verifi>;

@Schema({ timestamps: true })
export class Verifi {
  @Prop()
  email: string;

  @Prop()
  code: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: null })
  createdAt?: Date;
  updatedAt?: Date;
}

export const VerifiSchema = SchemaFactory.createForClass(Verifi);
