import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error.code';

export class BusinessException extends HttpException {
  readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode) {
    super(errorCode, errorCode.status);
    this.errorCode = errorCode;
  }
  getCode(): string {
    return this.errorCode.code;
  }
  getMessage(): string {
    return this.errorCode.message;
  }
}
