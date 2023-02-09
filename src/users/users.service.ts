import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyKeys, FilterQuery, Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/create-user.event';
import { UpdateUserDto } from './dto/update.user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { PagingResDto } from 'src/common/dto/response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async getPagingUsers(query: GetUsersDto): Promise<PagingResDto<UserDto>> {
    const filter: FilterQuery<UserDocument> = {};

    if (query.target) {
      filter[query.target] = { $regex: query.keyword || '', $options: 'i' };
    }

    if (query.start) {
      filter.createdAt = { $gte: new Date(query.start) };
    }

    if (query.end) {
      filter.createdAt = { $lte: new Date(query.end) };
    }

    if (query.ttmik) {
      filter.ttmik = { $eq: query.ttmik === '1' };
    }

    if (query.newsletter) {
      filter.newsletter = { $eq: query.newsletter === '1' };
    }

    if (query.countryCode) {
      filter.countryCode = { $eq: query.countryCode.toUpperCase() };
    }

    /*query.subscriptionType
      query.userState*/

    const docs = await this.userModel
      .find(filter)
      .limit(parseInt(query.limit))
      .skip((parseInt(query.page) - 1) * parseInt(query.limit))
      .sort({ createdAt: -1 });

    const total = await this.userModel.countDocuments(filter);
    const data: UserDto[] = docs.map((doc) => this._userDocToDto(doc));
    return {
      total,
      data,
    };
  }

  async updateById(userId: string, body: UpdateUserDto) {
    const set: AnyKeys<UserDocument> = {};
    if (body.fcmToken !== undefined) {
      set.fcmToken = body.fcmToken;
    }

    await this.userModel.findByIdAndUpdate(userId, { $set: set });
  }

  async updatePasswordByEmail(email: string, password: string) {
    const user = await this.userModel.findOne({ email, deleted: false });
    await user.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email, deleted: false });
    return user;
  }

  async findOneByEmailAll(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  async existingNickname(nickname: string): Promise<boolean> {
    const user = await this.userModel.findOne({ nickname, deleted: false });
    if (user) {
      return true;
    }
    return false;
  }

  async findById(id: string): Promise<UserDocument | false> {
    const user = await this.userModel.findById(id);
    if (!user || user.deleted) {
      return false;
    }
    return user;
  }

  async create(user: User) {
    const doc = await new this.userModel(user).save();

    this.eventEmitter.emit(
      UserCreatedEvent.event,
      new UserCreatedEvent(doc._id.toString()),
    );

    return doc._id.toString();
  }

  async deleteUser(id: string) {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { deleted: true, deletedAt: new Date() },
    });
  }

  _userDocToDto(doc: UserDocument): UserDto {
    const user = new UserDto();
    user.id = doc._id.toString();
    user.email = doc.email;
    user.countryCode = doc.countryCode;
    user.createdAt = doc.createdAt;
    return user;
  }
}
