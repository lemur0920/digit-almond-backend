import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Post as PostEntity} from '@prisma/client';

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

  async updatePost(postId:string , updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { ...updatePostDto }
    })
  }
}
