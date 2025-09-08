import { Job } from "bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { AlarmJobData } from "./alarms.service";
import { Process, Processor } from "@nestjs/bull";

@Processor('alarm-queue')
export class AlarmProcessor {
  constructor(private readonly prisma: PrismaService) {}

  // 'COMMENT' 타입 작업 처리
  @Process('COMMENT')
  async handleCommentAlarm(job: Job<AlarmJobData>) {
    const { receiverId, type, postId } = job.data;

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
}