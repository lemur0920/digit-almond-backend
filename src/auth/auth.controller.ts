import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';
import { ResponseDto } from '../common/response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<string>> {
    const accessToken = await this.authService.login(loginDto);
    return ResponseDto.success({
      message: "로그인 성공",
      data: accessToken,
    });
  }
}
