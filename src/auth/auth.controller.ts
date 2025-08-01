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
  async login(@Body() loginDto: LoginDto):Promise<ResponseDto<string>> {
    const user = await this.usersService.findByEmail(loginDto.email);

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
      );

    if (!isPasswordValid) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.INVALID_CREDENTIALS);
    }

    const accessToken = this.authService.generateAccessToken(user);
    return ResponseDto.success({
      message: "로그인 성공",
      data: accessToken
    })
  }
}
