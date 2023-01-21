import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule, AppConfigService } from './config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.mongoURI,
      }),
      inject: [AppConfigService],
    }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '24h' },
      }),
      inject: [AppConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppConfigService, AuthService],
})
export class AppModule {}
