import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PostsModule } from '../posts/posts.module';
import { AlarmsModule } from '../alarms/alarms.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [PostsModule, AlarmsModule]
})
export class CommentsModule {}
