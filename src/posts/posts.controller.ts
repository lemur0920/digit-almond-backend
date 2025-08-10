import { Body, Controller, Param, Patch, Post, Req } from '@nestjs/common';
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
    @Req() req
  ):Promise<ResponseDto<PostEntity>> {
    const userId = req?.user?.userId;
    const newPost = await this.postsService.createPost(userId, createPostDto);
    return ResponseDto.success({
      message: '게시글 등록 성공',
      data: await newPost
    })
  }

  @Patch(':id')
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') postId: string
  ) {
    const updatedPost = await this.postsService.updatePost(postId, updatePostDto);
    
  }
}
