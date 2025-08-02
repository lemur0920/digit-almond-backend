import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.usersService.findByEmail(loginDto.email);
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
        where: { criteria: { path: '$.trigger', equals: 'login' } },
      });

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

}
