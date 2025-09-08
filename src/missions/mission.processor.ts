import { Process, Processor } from "@nestjs/bull";
import { MissionType } from "@prisma/client";
import { Job } from "bullmq";
import { PrismaService } from "src/prisma/prisma.service";
import { EventEmitter } from "stream";

@Processor('mission-queue')
export class MissionProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter
  ) {}

  @Process('post.created')
  async handlePostCreation(job: Job<{ userId: string; type: string }>) {
    const { userId, type } = job.data;

    const missionsToUpdate = await this.prisma.mission.findMany({
      where: {
        trigger: 'POST_CREATED',
        type: type as MissionType,
        users: {
          none: {
            
          }
        }
        },
      },
      include: { badge: true },
    })
  }
}