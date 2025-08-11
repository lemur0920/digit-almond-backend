import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(commentsService: CommentsService) {}

}
