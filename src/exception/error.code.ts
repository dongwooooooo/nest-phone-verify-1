import { HttpStatus } from '@nestjs/common';

export class ErrorCode {
  readonly status: HttpStatus;
  readonly message: string;
  readonly code: string;

  constructor(status: HttpStatus, message: string, code: string) {
    this.status = status;
    this.message = message;
    this.code = code;
  }
}
export const ErrorCodes = {
  USER_NOT_FOUND: new ErrorCode(HttpStatus.NOT_FOUND, '사용자를 찾을 수 없습니다.', 'M004'),
  INVALID_PHONE_NUMBER: new ErrorCode(HttpStatus.BAD_REQUEST, '휴대폰 번호가 올바르지 않습니다.', 'P000'),
  INVALID_AUTH_CODE: new ErrorCode(HttpStatus.BAD_REQUEST, '인증 코드가 올바르지 않습니다.', 'P100'),
  AUTH_CODE_EXPIRED: new ErrorCode(HttpStatus.GONE, '인증 코드가 만료되었습니다.', 'P010'),
  AUTH_CODE_NOT_FOUND: new ErrorCode(HttpStatus.NOT_FOUND, '인증 코드를 찾을 수 없습니다.', 'P004'),
};
