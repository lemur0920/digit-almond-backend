import { CustomException, EXCEPTION_STATUS } from './custom-exception';

export class PaginationUtil {
  static calculatePagination(page: number, pageSize: number): { skip: number, take: number } {
    if (page <= 0 || pageSize <= 0) {
      throw new CustomException(EXCEPTION_STATUS.PAGE.INVALID_PARAMS);
    }
    return {
      skip: (page-1) * pageSize,
      take: pageSize
    };
  }
}