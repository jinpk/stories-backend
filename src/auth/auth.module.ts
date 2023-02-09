import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from 'src/admin/admin.module';
import { AppConfigService } from 'src/config';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Verifi, VerifiSchema } from './schemas/verifi.schema';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalAdminStrategy } from './strategy/local.strategy';
import { HttpModule } from '@nestjs/axios';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [
    HttpModule,
    AwsModule,
    UsersModule,
    AdminModule,
    PassportModule,
    MongooseModule.forFeature([{ name: Verifi.name, schema: VerifiSchema }]),
    JwtModule.registerAsync({
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '24h' },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalAdminStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
