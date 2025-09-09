import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { AlarmType } from '@prisma/client';
import { AlarmProcessor } from './alarms.processor';
import { AlarmJobData } from './alarms.service';
import { Job } from 'bullmq';

describe('AlarmProcessor 성능비교 테스트', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let alarmProcessor: AlarmProcessor;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    alarmProcessor = app.get<AlarmProcessor>(AlarmProcessor);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await prisma.alarm.deleteMany({});
  });

  const runBenchmark = async (
    handler: (job: Job<AlarmJobData>) => Promise<any>,
    jobName: string,
    numberOfJobs: number,
  ) => {
    console.log(`--- [${jobName}] ${numberOfJobs}개 작업 벤치마크 시작 ---`);
    console.time(`[${jobName}] ${numberOfJobs}개 작업 처리 시간`);

    for (let i = 0; i < numberOfJobs; i++) {
      const uniquePostId = (i + 1).toString().padStart(24, '0');
      
      const jobData: AlarmJobData = {
        receiverId: '111111111111111111111111',
        type: AlarmType.COMMENT,
        postId: uniquePostId,
      };

      const mockJob = { data: jobData } as Job<AlarmJobData>;

      await handler.call(alarmProcessor, mockJob);
    }

    console.timeEnd(`[${jobName}] ${numberOfJobs}개 작업 처리 시간`);

    const alarmCount = await prisma.alarm.count();
    console.log(`[${jobName}] 최종 알람 개수: ${alarmCount}`);
    expect(alarmCount).toBe(numberOfJobs);
    
    return alarmCount;
  };

  it('개선 전 로직(LEGACY_COMMENT)의 성능을 측정한다', async () => {
    const JOB_COUNT = 1000;
    await runBenchmark(
      alarmProcessor.handleLegacyCommentAlarm,
      'LEGACY_COMMENT',
      JOB_COUNT,
    );
  }, 60000);

  it('개선 후 로직(COMMENT)의 성능을 측정한다', async () => {
    const JOB_COUNT = 1000;
    await runBenchmark(
      alarmProcessor.handleCommentAlarm,
      'COMMENT',
      JOB_COUNT,
    );
  }, 60000);
});