import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthCodeManager {
  generateAuthCode() {
    return crypto.randomInt(0, 1000000).toString().padStart(6, '0'.toString());
  }

  isAuthCodeExipred(expiredAt: Date) {
    return expiredAt < new Date();
  }

  getExpirationDate() {
    return new Date(Date.now() + 1000 * 60 * 5);
  }
}
