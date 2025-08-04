import { HttpException } from '@nestjs/common';

export const EXCEPTION_STATUS = {
  AUTH: {
    INVALID_TOKEN: {
      errorCode: 10001,
      message: '유효하지 않거나 만료된 토큰입니다.',
      statusCode: 401,
    },
    TOKEN_EXPIRED: {
      errorCode: 10002,
      message: '토큰이 만료되었습니다.',
      statusCode: 401,
    },
    INVALID_CREDENTIALS: {
      errorCode: 10003,
      message: '이메일 또는 비밀번호가 잘못되었습니다.',
      statusCode: 401
    },
    UNAUTHENTICATED: {
      errorCode: 10004,
      message: '로그인이 필요합니다.',
      statusCode: 401
    },
    SESSION_TOKEN_MISSING_ERROR: {
      errorCode: 10005,
      message: '회원 ID 또는 세션 토큰이 필요합니다.',
      statusCode: 401
    },
    UNMATCHED_PASSWORD: {
      errorCode: 10006,
      message: '비밀번호 확인이 일치하지 않습니다.',
      statusCode: 400
    }
  },
  USER: {
    ALREADY_EXISTS: {
      errorCode: 20001,
      message: '이미 존재하는 유저입니다.',
      statusCode: 409
    },
    NOT_FOUND: {
      errorCode: 20002,
      message: '해당 이메일의 유저가 존재하지 않습니다.',
      statusCode: 404
    },
  },
  CITY: {
    NOT_EXISTS: {
      errorCode: 30001,
      message: '요청하신 도시는 데이터베이스에 존재하지 않습니다.',
      statusCode: 404
    },
    ALREADY_EXISTS: {
      errorCode: 30002,
      message: '해당 국가에 이미 동일한 도시가 존재합니다.',
      statusCode: 409
    }
  },
  COUNTRY: {
    NOT_EXISTS: {
      errorCode: 40001,
      message: '해당 국가는 존재하지 않습니다.',
      statusCode: 404
    }
  }

}

export class CustomException extends HttpException {
  constructor(exception: { errorCode: number, message: string, statusCode: number }) {
    super({ errorCode: exception.errorCode, message: exception.message }, exception.statusCode);
  }
}