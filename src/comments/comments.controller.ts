import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { ResponseDto } from '../common/response.dto';
import { Comment } from '@prisma/client';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Param('postId') postId: string,
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<ResponseDto<Comment>> {
    const commentorId = req.user.userId;
    const comment = await this.commentsService.createComment(postId, commentorId, createCommentDto);

    return ResponseDto.success({
      message: '댓글 등록 성공',
      data: comment
    })
  }

  @Get()
  async getComments(
    @Param('postId') postId: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string
  ): Promise<ResponseDto<Comment[]>>{
    const pageNumber = page ? parseInt(page, 10) : 1;
    const pageSizeNumber = pageSize ? parseInt(pageSize, 10) : 10;

    const comments = await this.commentsService.getCommentsByPost(postId, pageNumber, pageSizeNumber);

    return ResponseDto.success({
      message: '전체 댓글 조회 성공',
      data: comments
    })
  }

  @Patch('commentId')
  async updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    updateCommentDto: UpdateCommentDto
  ): Promise<ResponseDto<Comment>> {
    const updatedComment = await this.commentsService.updateComment(commentId, updateCommentDto)

    return ResponseDto.success({
      message: '댓글 수정 성공',
      data: updatedComment
    })
  }

  @Delete('commentId')
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string
  ): Promise<ResponseDto<null>> {
    const deletedComment = this.commentsService.deleteComment(commentId);

    return ResponseDto.success({
      message: '댓글 삭제 성공',
      data: null
    })
  }
}
