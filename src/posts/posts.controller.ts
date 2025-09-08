import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ResponseDto } from '../common/response.dto';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { Post as PostEntity } from '@prisma/client';
import { UpdatePostDto } from './dtos/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {};

  @Post('')
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: any
  ):Promise<ResponseDto<PostEntity>> {
    const userId = req?.user?.userId;
    const newPost = await this.postsService.createPost(userId, createPostDto);
    return ResponseDto.success({
      message: '게시글 등록 성공',
      data: newPost
    }) 
  }

  @Patch(':id')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') postId: string
  ):Promise<ResponseDto<PostEntity>> {
    const updatedPost = await this.postsService.updatePost(postId, updatePostDto);
    return ResponseDto.success({
      message: '게시글 수정 성공',
      data: updatedPost
    })
  }

  @Delete(':id')
  async deletePost(@Param('id') postId: string): Promise<ResponseDto<null>> {
    await this.postsService.deletePost(postId);
    return ResponseDto.success({
      message: '게시글 삭제 성공',
      data: null
    })
  }

  @Get('')
  async getPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ResponseDto<PostEntity[]>> {
    const pageNumber = page ? parseInt(page, 10) : 1 // 기본값 설정
    const pageSizeNumber = pageSize ? parseInt(pageSize, 10) : 10;
    const posts = await this.postsService.getPosts(pageNumber, pageSizeNumber);
    return ResponseDto.success({
      message: '게시글 조회 성공',
      data: posts
    })
  }

  @Get(':id')
  async getPostById(
    @Param('id') postId: string
  ):Promise<ResponseDto<PostEntity>> {
    const post = await this.postsService.getPostDetail(postId);

    return ResponseDto.success({
      message: '게시글 상세 조회 성공',
      data: post
    })
  }
}
