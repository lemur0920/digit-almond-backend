import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { Comment, Prisma } from '@prisma/client';
import { PaginationUtil } from '../common/pagination.util';
import { CreateCommentDto } from './dtos/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommentsByPost(postId: string, page: number, pageSize: number): Promise<Comment[]> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
        isDeleted: false
      }
    });
    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    const { skip, take } = PaginationUtil.calculatePagination(page, pageSize);

    return this.prisma.comment.findMany({
      where: { postId: postId, isDeleted: false },
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
    } as Prisma.CommentFindManyArgs)
  }

  //TODO: 동작 체크
  async createComment(postId: string, commentorId: string, createCommentDto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    });
    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        postId: postId,
        commentorId: commentorId,
      },
    })
  }
}
