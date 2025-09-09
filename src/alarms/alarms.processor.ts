import { Job } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { AlarmJobData } from "./alarms.service";
import { Process, Processor } from "@nestjs/bull";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Processor('alarm-queue')
export class AlarmProcessor {
  constructor(private readonly prisma: PrismaService) {}

  // 'COMMENT' 타입 작업 처리
  @Process('COMMENT')
  async handleCommentAlarm(job: Job<AlarmJobData>) {
    const { receiverId, type, postId } = job.data;
    return this.prisma.alarm.upsert({
    where: {
      receiverId_type_postId: {
        receiverId: receiverId,
        type: type,
        postId: postId,
      },
    },
    update: {}, 
    create: {
      receiverId: receiverId,
      type: type,
      postId: postId,
      },
    });
  }

  // 벤치마킹용 개선 전 로직
  @Process('LEGACY_COMMENT')
  async handleLegacyCommentAlarm(job: Job<AlarmJobData>) {
    const { receiverId, type, postId } = job.data;

    const existingAlarm = await this.prisma.alarm.findFirst({
      where: { receiverId, type, postId },
    });

    if (existingAlarm) {
      return existingAlarm;
    }

    return this.prisma.alarm.create({
      data: { receiverId, type, postId },
    })
  }
}
