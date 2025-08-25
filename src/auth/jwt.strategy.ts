import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import * as process from 'process';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new CustomException(EXCEPTION_STATUS.USER.NOT_FOUND);
    }
    const userId = payload.sub;
    return { userId: payload.sub, email: payload.email };
  }
}
