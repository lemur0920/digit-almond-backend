import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RedisService]
})
export class AuthModule {}
