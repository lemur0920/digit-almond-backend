import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { path, method } = request;

    // 회원가입(POST / users) 및 로그인(POST /auth/login) 경로는 예외
    if ((path === '/auth/login' && method === 'POST') ||
      (path === '/users' && method === 'POST')) {
      return true;
    }

    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return false;
    }

    return true;
  }
}