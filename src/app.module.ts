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

@Module({
  imports: [UsersModule, AuthModule, TodosModule, PostsModule, MissionsModule, BadgesModule, CitiesModule, AlarmsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
