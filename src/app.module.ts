import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';
import { PostsModule } from './posts/posts.module';
import { MissionsModule } from './missions/missions.module';
import { BadgesModule } from './badges/badges.module';
import { CitiesModule } from './cities/cities.module';
import { AlarmsModule } from './alarms/alarms.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CountriesModule } from './countries/countries.module';
import { CommentsModule } from './comments/comments.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RedisService } from './redis/redis.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [UsersModule, AuthModule, TodosModule, PostsModule, MissionsModule, BadgesModule, CitiesModule, AlarmsModule, CountriesModule, PrismaModule, ConfigModule.forRoot(({ isGlobal: true })), CommentsModule,
    MulterModule.register({
      dest: './upload',
    }),
    PrometheusModule.register({
      defaultMetrics: {
      enabled: true,
      },
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379,
        password: process.env.REDIS_PASSWORD
      }
    }),
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
    RedisService
  ],
  exports: [RedisService],
})
export class AppModule {}
