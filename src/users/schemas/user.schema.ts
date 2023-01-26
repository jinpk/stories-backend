import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { compareSync, genSalt, hash } from 'bcrypt';

export type UserDocument = HydratedDocument<User & UserMethods>;

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
  genSalt()
    .then((salt) => {
      hash(this.password, salt)
        .then((hashed) => {
          this.password = hashed;
          next();
        })
        .catch((err) => {
          console.error('hash user password (2): ', err);
          next(new Error('암호화 오류'));
        });
    })
    .catch((err) => {
      console.error('hash user password (1): ', err);
      next(new Error('암호화 오류'));
    });
});

interface UserMethods {
  comparePassword?: (password: string) => Promise<boolean>;
}

UserSchema.methods.comparePassword = async function (password) {
  return compareSync(password, this.password);
};
