import { Injectable } from '@nestjs/common';
import { AuthCodeData } from './authCodeData';

@Injectable()
export class AuthCodeRepository {
  private phoneCodeMap = new Map<string, { code: string; expiredAt: Date }>();

  public saveAuthCode(phoneNumber: string, authCodeData: AuthCodeData) {
    this.phoneCodeMap.set(phoneNumber, authCodeData);
  }
  public findAuthCode(phoneNumber: string): AuthCodeData | undefined {
    return this.phoneCodeMap.get(phoneNumber);
  }
  public deleteAuthCode(phoneNumber: string): boolean {
    return this.phoneCodeMap.delete(phoneNumber);
  }
  public deleteExpiredAuthCodes(): void {
    const current = new Date();
    this.phoneCodeMap.forEach((value, key) => {
      if (value.expiredAt < current) {
        this.phoneCodeMap.delete(key);
      }
    });
  }
}
