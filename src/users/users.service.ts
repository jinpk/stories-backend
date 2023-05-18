/*
  유저 조회,등록,관리 서비스 함수
  -관리자 유저 관리
  -사용자 조회/등록
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AnyKeys, FilterQuery, Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { WelcomePromotion, WelcomePromotionDocument } from './schemas/welcome-promotion.schema';
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
    @InjectModel(WelcomePromotion.name) private welcomepromotionModel: Model<WelcomePromotionDocument>,
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
    private awsService: AwsService,
  ) {}

  /*
  * test JWT
  * @params:
  * @return:
  */
  async __testGenTTMIKJWT() {
    return await this.jwtService.signAsync(
      { sub: -1 },
      { secret: this.awsService.getParentJwtSecretKey },
    );
  }

  /*
  * JWT 검증
  * @params:
  *   token:                string
  * @return: true || false  boolean
  */
  async verifyTTMIKJWT(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.awsService.getParentJwtSecretKey,
    });
    if (payload.sub === -1) {
      return true;
    }
    return false;
  }

  /*
  * 유저 활성화 여부 확인 by email
  * @params:
  *   email:                string
  * @return: User             object
  */
  async getActiveUserByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({
      deleted: { $ne: true },
      email,
    });

    return doc;
  }

  /*
  * FCM 푸시 활성화 목록 조회
  * @params:
  * @return: [
  *   "fcmtoken",           string
  * ]
  */
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

  /*
  * 유저 리스트 조회
  * @params:
  *   email:              string
  *   body:               UpdateUserTTMIKDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       UserDocument
  *     },
  *   ]
  * }
  */
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

  /*
  * 유저 정보 수정
  * @params:
  *   email:             string
  *   body:               UpdateUserTTMIKDto
  * @return:
  */
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

  /*
  * 유저 정보 수정
  * @params:
  *   userId:             string
  *   body:               UpdateUserDto
  * @return:
  */
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

  /*
  * 삭제 여부 고려O 유저 조회 by email
  * @params:
  *   email:             string
  * @return:
  *   user               UserDocument
  */
  async findOneByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email, deleted: false });
    return user;
  }

  /*
  * 삭제 여부 고려X 유저 조회 by email
  * @params:
  *   email:             string
  * @return:
  *   user               UserDocument
  */
  async findOneByEmailAll(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  /*
  * 유저 조회 by nickname
  * @params:
  *   nickname:             string
  * @return: true || false  boolean
  */
  async existingNickname(nickname: string): Promise<boolean> {
    const user = await this.userModel.findOne({ nickname, deleted: false });
    if (user) {
      return true;
    }
    return false;
  }

  /*
  * 유저 조회 by id
  * @params:
  *   id:              string
  * @return: {
  *   user               UserDocument
  * }
  */
  async findById(id: string): Promise<UserDocument | false> {
    const user = await this.userModel.findById(id);
    if (!user || user.deleted) {
      return false;
    }
    return user;
  }

  /*
  * 유저 가입 및 생성 함수
  * @params:
  *   user:              User
  * @return: {
  *   string
  * }
  */
  async create(user: User) {
    const doc = await new this.userModel(user).save();

    this.eventEmitter.emit(
      UserCreatedEvent.event,
      new UserCreatedEvent(doc._id.toString(), doc.email, doc.nickname),
    );

    // 3일 무료 이용권 생성
    let exist = await this.userModel.find({
      email: { $eq: doc.email}
    });

    // 처음 가입한 이메일인 경우만 지급
    if (exist.length <= 1){
      let welcome = new WelcomePromotion();
      welcome.userId = doc._id;
      await this.welcomepromotionModel.create(welcome)
    }

    return doc._id.toString();
  }

  /*
  * 유저 탈퇴 및 삭제 함수
  * @params:
  *   id:                   string
  * @return: {}
  */
  async deleteUser(id: string) {
    await this.userModel.findByIdAndUpdate(id, {
      $set: { deleted: true, deletedAt: new Date() },
    });
  }

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                UserDocument
  * @return: {
  *   user:               UserDto
  */
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
