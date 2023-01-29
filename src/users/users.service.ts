import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyKeys, Model } from 'mongoose';
import { ExistUserDto } from '../auth/dto/exist-user.dto';
import { UserDto } from './dto/user.dto';
import { ExistQueryFields, OAuthProviers } from '../auth/enums';
import { User, UserDocument } from './schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/create-user.event';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async findByOAuthId(
    provider: OAuthProviers,
    id: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      deleted: false,
      [provider === OAuthProviers.Google
        ? 'googleLogin'
        : provider === OAuthProviers.Facebook
        ? 'facebookLogin'
        : 'appleLogin']: id,
    });
    return user;
  }

  async getExistingUser(query: ExistUserDto): Promise<boolean> {
    switch (query.field) {
      case ExistQueryFields.Email:
        const user = await this.findOneByEmail(query.value);
        if (user) {
          return true;
        }
        return false;
      case ExistQueryFields.Nickname:
        return await this.existingNickname(query.value);
      default:
        throw new Error('잘못된 parameter');
    }
  }

  async updateById(userId: string, body: UpdateUserDto) {
    const set: AnyKeys<UserDocument> = {};
    if (body.fcmToken !== undefined) {
      set.fcmToken = body.fcmToken;
    }

    if (body.nickname !== undefined) {
      set.nickname = body.nickname;
    }

    if (body.subNewsletter !== undefined) {
      set.subNewsletter = body.subNewsletter;
    }

    await this.userModel.findByIdAndUpdate(userId, { $set: set });
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email, deleted: false });
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
    user.name = doc.name;
    user.nickname = doc.nickname;
    user.email = doc.email;
    user.ttmik = doc.ttmik;
    user.subNewsletter = doc.subNewsletter;
    user.countryCode = doc.countryCode;
    user.createdAt = doc.createdAt;

    return user;
  }
}
