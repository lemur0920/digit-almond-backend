import { Body, Injectable, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmType, Prisma } from '@prisma/client';

@Injectable()
export class AlarmsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAlarmForComment(postId: string, receiverId: string, type: AlarmType) {
    // 게시글 관련 알람이 이미 존재하는지 확인
    const existingAlarm = await this.prisma.alarm.findFirst({
      where: {
        receiverId: receiverId,
        type: type,
        postId: postId
      },
    });

    // 알람이 이미 존재하면 생성하지 않음
    if (existingAlarm) {
      return existingAlarm;
    }

    return this.prisma.alarm.create({
      data: {
        receiverId: receiverId,
        type: type,
        postId: postId
      }
    })
  }

  async getAlarms(receiverId: string) {
    return this.prisma.alarm.findMany({
      where: { receiverId },
      orderBy: { createdAt: 'desc' },
    } as Prisma.AlarmFindManyArgs)
  }

  async deleteAlarms(alarmId: string) {
    return this.prisma.alarm.delete({
      where: { id: alarmId }
    })
  }

}
