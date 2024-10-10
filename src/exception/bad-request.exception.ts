import { BusinessException } from './business.exception';
import { ErrorCode } from './error.code';

export class BadRequestException extends BusinessException {
  constructor(errorCode: ErrorCode) {
    super(errorCode);
  }
}
