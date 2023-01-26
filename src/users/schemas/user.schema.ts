import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  nickname: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  subNewsletter: boolean;

  @Prop({ uppercase: true })
  countryCode: string;

  @Prop({ default: false })
  ttmik: boolean;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt
    .genSalt()
    .then((salt) => {
      bcrypt
        .hash(this.password, salt)
        .then((hash) => {
          this.password = hash;
          next();
        })
        .catch((err) => {
          next(new Error('암호화 오류'));
        });
    })
    .catch((err) => {
      next(new Error('암호화 오류'));
    });
});

UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt
    .compare(password, this.password)
    .then((success) => cb(null, success))
    .catch((e) => {
      cb(e);
    });
};
