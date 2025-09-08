import { Module } from '@nestjs/common';
import { AlarmsController } from './alarms.controller';
import { AlarmsService } from './alarms.service';
import { RedisService } from '../redis/redis.service';
import { makeCounterProvider, PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'alarm-queue',
    }),
  ],
  controllers: [AlarmsController],
  providers: [
    AlarmsService,
    AlarmProcessor,
    makeCounterProvider({
      name: 'alarm_creation_attempts_total',
      help: 'Total number of alarm creation attempts',
    }),
    makeCounterProvider({
      name: 'alarm_deletion_attempts_total',
      help: 'Total number of alarm deletion attempts',
    }),
  ],
  exports: [AlarmsService]
})
export class AlarmsModule {}
