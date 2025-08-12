import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { PaginationUtil } from '../common/pagination.util';
import { AlarmsService } from '../alarms/alarms.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {};

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        userId: userId,
      }
    });

  }

  async updatePost(postId:string , updatePostDto: UpdatePostDto): Promise<PostEntity> {
    await this.findPostOrThrow(postId);

    return this.prisma.post.update({
      where: { id: postId },
      data: { ...updatePostDto }
    })
  }

  async deletePost(postId: string):Promise<void> {
    await this.findPostOrThrow(postId);

    await this.prisma.$transaction(async (prisma) => {
      await prisma.comment.updateMany({
        where: { postId: postId },
        data: { isDeleted: true }
      });

      await prisma.post.update({
        where: { id: postId },
        data: { isDeleted: true }
      })
    });
  }

  async getPosts(page: number, pageSize: number): Promise<PostEntity[]> {
    const { skip, take } = PaginationUtil.calculatePagination(page, pageSize);

    return this.prisma.post.findMany({
      skip: skip,
      take: take,
      where: {
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' } // 최신순 정렬
    } as Prisma.PostFindManyArgs);
  }


  // 실서비스 사용 로직
  async getPostDetail(postId: string):Promise<PostEntity> {
    await this.findPostOrThrow(postId);

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })
  }

  //헬퍼 함수
  async findPostOrThrow(postId: string, fields?: Prisma.PostSelect): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      select: fields
    });

    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    return post;
  }
}
