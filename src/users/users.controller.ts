import { Body, Controller, Get, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ResponseDto } from '../common/response.dto';
import { Profile, User } from '@prisma/client';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
    return req.user;
  }


  @Post('me/profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  async createProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: any
  ): Promise<ResponseDto<Profile>> {
    console.log(createProfileDto);
    console.log(file);
    const filePath = file?.path || null; // 파일 경로 설정
    const profile = this.usersService.createProfile(req.user.userId, { nickname: createProfileDto.nickname, description: createProfileDto.description }, filePath);
    return ResponseDto.success({
      message: "프로필 생성 성공",
      data: await profile
    })
  }

  @Patch('me/profile')
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: any
  ): Promise<ResponseDto<Profile>> {
    const filePath = file?.path;
    const updatedProfile = this.usersService.updateProfile(req.user.userId, updateProfileDto);

    return ResponseDto.success({
      message: '프로필 수정 성공',
      data: await updatedProfile
    })
  }

  @Patch('me/password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any
    ): Promise<ResponseDto<void>> {
    await this.usersService.changePassword(req.user.userId, changePasswordDto);

    return ResponseDto.success({
      message: '비밀번호 변경 성공',
      data: undefined
    })

  }
}
