import { Body, Injectable, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmType } from '@prisma/client';

@Injectable()
export class AlarmsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAlarm(receiverId: string, type: AlarmType) {
    return this.prisma.alarm.create({
      data: {
        receiverId: receiverId,
        type: type,
      }
    })
  }
}
