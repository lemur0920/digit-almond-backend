import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Badge, User } from '@prisma/client';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { PrismaService } from '../prisma/prisma.service';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
  ) {}

  generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
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

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
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

    return this.generateAccessToken(user);
  }

  async login(loginDto: LoginDto): Promise<string> {
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

    return this.generateAccessToken(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.revokeRefreshToken(refreshToken)
  }
}
