import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomException, EXCEPTION_STATUS } from '../common/custom-exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any) {
    if (err || !user) {
      throw new CustomException(EXCEPTION_STATUS.AUTH.UNAUTHENTICATED);
    }
    return user;
  }
  canActivate(context: import('@nestjs/common').ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { path, method } = request;
    console.log(`path: ${path}, Method: ${method}`);

    // 예외 경로 처리
    if ((path === '/api/auth/login' && method === 'POST') ||
      (path === '/api/users' && method === 'POST')) {
      return true;
    }

    // 기본 AuthGuard 동작 처리
    return super.canActivate(context);
  }
}