import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Badge, User } from '@prisma/client';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService
  ) {}

  async generateAccessToken(user: User):Promise<string> {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Redis 토큰 저장 (TTL: 1시간)
    const cacheKey = `auth:token:${user.id}`;
    await this.redisService.set(cacheKey, token, 3600);

    return token;
  }

  async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });



    return refreshToken;
  }

  async deleteAccessToken(userId: string): Promise<void> {
    const cacheKey = `auth:token:${userId}`;
    try {
      const cachedToken = await this.redisService.get(cacheKey);
      if (cachedToken === null) {
        throw new CustomException(EXCEPTION_STATUS.REDIS.KEY_NOT_FOUND);
      }
      await this.redisService.del(cacheKey);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(EXCEPTION_STATUS.REDIS.ERROR);
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const token = await this.prisma.refreshToken.deleteMany({
      where: {
        userId: userId
      },
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || new Date() > storedToken.expiresAt) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.INVALID_TOKEN);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new CustomException(EXCEPTION_STATUS.USER.NOT_FOUND);
    }

    const newAccessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    const cacheKey = `auth:token:${userId}`;
    const cachedToken = await this.redisService.get(cacheKey);

    // Redis에 저장된 토큰과 값 비교
    return cachedToken == token;
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new CustomException(EXCEPTION_STATUS.USER.NOT_FOUND);
    }
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.INVALID_CREDENTIALS);
    }

    // 첫 로그인 여부 확인
    if (!user.firstLoginAt) {
      // 첫 로그인 처리
      await this.prisma.user.update({
        where: { id: user.id },
        data: { firstLoginAt: new Date() },
      });

      const badge = await this.prisma.badge.findFirst({
        where: {
          criteria: {
            equals: {
              trigger: 'login',
              count: 1
            }
          },
        }
      })


      if (badge) {
        await this.prisma.userBadge.create({
          data: {
            userId: user.id,
            badgeId: badge.id,
            acquiredAt: new Date(),
          },
        });
      }
    }
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const cacheKey = `auth:token:${user.id}`;
    await this.redisService.set(cacheKey, accessToken, 3600);

    return { accessToken, refreshToken };

  }

  async logout(userId: string): Promise<void> {

    await this.deleteAccessToken(userId);
    await this.revokeRefreshToken(userId);
  }
}
