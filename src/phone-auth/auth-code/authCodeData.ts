export class AuthCodeData {
  code: string;
  expiredAt: Date;

  constructor(code: string, expiredAt: Date) {
    this.code = code;
    this.expiredAt = expiredAt;
  }
}
