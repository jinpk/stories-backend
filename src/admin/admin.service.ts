/*
  어드민 유저 조회 서비스 함수
  -관리자 유저 조회
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.adminModel.findOne({ username });

    if (admin && (await admin.comparePassword(password))) {
      return admin._id;
    }

    return null;
  }

  /*
  * adminUser 조회
  * @params:
  *   id:             string
  * @return:          AdminDocument
  */
  async findById(id: string): Promise<AdminDocument | false> {
    const adminUser = await this.adminModel.findById(id);
    if (!adminUser) {
      return false;
    }
    return adminUser;
  }
}
