import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthCodeRepository } from './auth-code.repository';

@Injectable()
export class AuthCodeScheduler {
  constructor(private readonly authCodeRepository: AuthCodeRepository) {}

  @Cron('0 0 * * * *')
  handleExpiredAuthCodeCleanUp() {
    this.authCodeRepository.deleteExpiredAuthCodes();
  }
}
