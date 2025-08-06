import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { ResponseDto } from '../common/response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<{ accessToken: string, refreshToken: string }>> {
    const tokens = await this.authService.login(loginDto);
    return ResponseDto.success({
      message: "로그인 성공",
      data: tokens,
    });
  }

  @Post('logout')
  async logout(@Req() req): Promise<ResponseDto<null>> {
    // if (!refreshToken) {
    //   throw new CustomException(EXCEPTION_STATUS.AUTH.INVALID_TOKEN);
    // }
    const userId = req?.user?.userId;
    console.log(req.user);
    if (!userId) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.UNAUTHENTICATED);
    }
    await this.authService.logout(userId);

    return ResponseDto.success({
      message: "로그아웃 성공",
      data: null
    });
  }

}
