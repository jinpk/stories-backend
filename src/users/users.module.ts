import { WelcomePromotion, WelcomePromotionSchema } from './schemas/welcome-promotion.schema';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AwsModule } from 'src/aws/aws.module';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserAgree, UserAgreeSchema } from './schemas/user-agree.schema';
import { UsersAgreeService } from './users-agree.service';

@Module({
  imports: [
    AwsModule,
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: WelcomePromotion.name, schema: WelcomePromotionSchema }]),
    MongooseModule.forFeature([
      { name: UserAgree.name, schema: UserAgreeSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersAgreeService],
  exports: [UsersService, UsersAgreeService],
})
export class UsersModule {}
