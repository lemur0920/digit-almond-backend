import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Post as PostEntity, Prisma } from '@prisma/client';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { PaginationUtil } from '../common/pagination.util';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {};
  async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        userId: userId,
      }
    })
  }

  async updatePost(postId:string , updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: { ...updatePostDto }
    })
  }

  async deletePost(postId: string):Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    await this.prisma.post.delete({
      where: { id: postId }
    })
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


  //TODO: viewCount 증가
  async getPostById(postId: string):Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
        isDeleted: false
      }
    })
    if (!post) {
      throw new CustomException(EXCEPTION_STATUS.POST.NOT_FOUND);
    }

    return post;
  }
}
