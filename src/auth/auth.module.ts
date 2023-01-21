import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from 'src/config';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule, AppConfigModule],
  providers: [AuthService, LocalStrategy, JwtService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
