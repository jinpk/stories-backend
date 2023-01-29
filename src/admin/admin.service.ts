import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/users.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private usersService: UsersService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.adminModel.findOne({ username });

    if (admin && (await admin.comparePassword(password))) {
      return admin._id;
    }

    return null;
  }

  async findById(id: string): Promise<AdminDocument | false> {
    const user = await this.adminModel.findById(id);
    if (!user) {
      return false;
    }
    return user;
  }

  async createUser(params: CreateUserDto) {
    const user: User = {
      email: params.email,
      password: params.password,
      name: params.nickname,
      nickname: params.nickname,
      subNewsletter: false,
      countryCode: 'kr',
      ttmik: false,
      deleted: false,
    };

    const sub = await this.usersService.create(user);
    return sub;
  }
}
