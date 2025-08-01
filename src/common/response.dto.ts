export class ResponseDto<T> {
  message: string;
  data: T

  static success<T>(options: { message: string; data?: T }): ResponseDto<T> {
    return {
      message: options.message,
      data: options.data
    }
  }
}