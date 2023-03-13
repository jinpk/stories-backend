import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyKeys, FilterQuery, Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/create-user.event';
import { UpdateUserDto, UpdateUserTTMIKDto } from './dto/update.user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { PagingResDto } from 'src/common/dto/response.dto';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';
import { CommonExcelService } from 'src/common/providers';
import { EXCEL_COLUMN_LIST } from './users.constant';

@Injectable()
export class UsersService {
  constructor(
    private commonExcelService: CommonExcelService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
    private awsService: AwsService,
  ) {
    this.create({
      email: 'jinho39858@gmail.com',
      nickname: 'hi',
      countryCode: '',
      newsletter: false,
      ttmik: false,
    });
  }

  async __testGenTTMIKJWT() {
    return await this.jwtService.signAsync(
      { sub: -1 },
      { secret: this.awsService.getParentJwtSecretKey },
    );
  }

  async verifyTTMIKJWT(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.awsService.getParentJwtSecretKey,
    });
    if (payload.sub === -1) {
      return true;
    }
    return false;
  }

  async getActiveFCMUsers(): Promise<string[]> {
    const docs = await this.userModel
      .find()
      .and([
        { fcmToken: { $ne: '' } },
        { fcmToken: { $ne: null } },
        { deleted: false },
      ]);

    return docs.map((doc) => doc.fcmToken);
  }

  async getPagingUsers(
    query: GetUsersDto,
  ): Promise<PagingResDto<UserDto> | Buffer> {
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

    if (query.excel === '1') {
      const docs = await this.userModel.find(filter).sort({ createdAt: -1 });
      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST,
        docs,
      );
    }

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

  async updateTTMIKByEmail(email: string, body: UpdateUserTTMIKDto) {
    const set: AnyKeys<UserDocument> = {};
    if (body.nickname !== undefined) {
      set.nickname = body.nickname;
    }

    if (body.ttmik !== undefined) {
      set.ttmik = body.ttmik;
    }

    await this.userModel.findOneAndUpdate({ email }, { $set: set });
  }

  async updateById(userId: string, body: UpdateUserDto) {
    const set: AnyKeys<UserDocument> = {};
    if (body.fcmToken !== undefined) {
      set.fcmToken = body.fcmToken;
    }

    if (body.nickname !== undefined) {
      set.nickname = body.nickname;
    }

    if (body.ttmik !== undefined) {
      set.ttmik = body.ttmik;
    }

    if (body.newsletter !== undefined) {
      set.newsletter = Boolean(body.newsletter);
    }

    await this.userModel.findByIdAndUpdate(userId, { $set: set });
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
      new UserCreatedEvent(doc._id.toString(), doc.email, doc.nickname),
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
    user.nickname = doc.nickname;
    user.countryCode = doc.countryCode;
    user.createdAt = doc.createdAt;
    user.newsletter = doc.newsletter;
    user.ttmik = doc.ttmik;
    return user;
  }
}
