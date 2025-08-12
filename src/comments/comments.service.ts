import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { Comment, Prisma } from '@prisma/client';
import { PaginationUtil } from '../common/pagination.util';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PostsService } from '../posts/posts.service';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { AlarmsService } from '../alarms/alarms.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly alarmsService: AlarmsService
  ) {}

  async getCommentsByPost(postId: string, page: number, pageSize: number): Promise<Comment[]> {
    await this.postsService.findPostOrThrow(postId);

    const { skip, take } = PaginationUtil.calculatePagination(page, pageSize);

    return this.prisma.comment.findMany({
      where: { postId: postId, isDeleted: false },
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
    } as Prisma.CommentFindManyArgs)
  }

  //TODO: 동작 체크
  async createComment(postId: string, commentorId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const post = await this.postsService.findPostOrThrow(postId, { userId: true });
    const authorId = post.userId;
    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        postId: postId,
        commentorId: commentorId
      },
    });
    await this.alarmsService.createAlarm(authorId, 'COMMENT')

    return comment;

  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    await this.validateCommentExists(commentId)
    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        ...updateCommentDto
      }
    })
  }

  async validateCommentExists(commentId: string): Promise<void> {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId, isDeleted: false }
    });
    if (!existingComment) {
      throw new CustomException(EXCEPTION_STATUS.COMMENT.NOT_FOUND);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.validateCommentExists(commentId);
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    })
  }
}
