import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email, deleted: false });
    return user;
  }

  async create(user: User) {
    const doc = await new this.userModel(user).save();
    return doc._id.toString();
  }
}
