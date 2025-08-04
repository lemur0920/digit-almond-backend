import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseDto } from '../common/response.dto';
import { Profile, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseDto<User>> {
    const newUser = this.usersService.createUser(createUserDto);

    return ResponseDto.success({
      message: "유저 추가 성공",
      data: await newUser
    })
  }
  @Get('me')
  getProfile(@Req() req) {
    console.log(req.user.userId);
    return req.user;
  }


  @Post('me/profile')
  async createProfile(
    @Body() createProfileDto: CreateProfileDto,
    @Req() req
  ): Promise<ResponseDto<Profile>>{
    if (!req.user || req.user.userId) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.UNAUTHENTICATED);
    }
    const profile = this.usersService.createProfile(req.user.id, createProfileDto);
    return ResponseDto.success({
      message: "프로필 생성 성공",
      data: await profile
    })
  }
}
