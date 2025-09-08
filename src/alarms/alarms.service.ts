import { Body, Injectable, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmType, Prisma } from '@prisma/client';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';

export interface AlarmJobData {
  type: AlarmType,
  receiverId: string;
  postId?: string;
}

@Injectable()
export class AlarmsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectMetric('alarm_creation_attempts_total')
    private readonly creationAttemptsMetric: Counter<string>,
    @InjectMetric('alarm_deletion_attempts_total')
    private readonly deletionAttemptsMetric: Counter<string>,
    @InjectQueue('alarm-queue') private readonly alarmQueue: Queue
  ) {}

  async addAlarmJob(jobData: AlarmJobData) {
    await this.alarmQueue.add(jobData.type, jobData);
  }

  async createAlarmForComment(postId: string, receiverId: string, type: AlarmType) {
    // 게시글 관련 알람이 이미 존재하는지 확인
    this.creationAttemptsMetric.inc();

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

  async deleteAlarms(alarmId: string, userId: string): Promise<void> {
    this.deletionAttemptsMetric.inc();

    const alarm = await this.prisma.alarm.findUnique({
      where: { id: alarmId }
    });

    if (!alarm) {
      throw new CustomException(EXCEPTION_STATUS.ALARM.NOT_FOUND);
    }
    if (alarm.receiverId !== userId) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.FORBIDDEN);
    }

    // 알람 삭제
    await this.prisma.alarm.delete({
      where: { id: alarmId }
    })
  }
}
