import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email }
    })
    return user;
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })
    return user;
  }

  async findProfileById(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId: userId },
    });
  }
}