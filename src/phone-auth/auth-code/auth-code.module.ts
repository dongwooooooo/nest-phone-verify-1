import { Module } from '@nestjs/common';
import { AuthCodeManager } from './auth-code.manager';
import { AuthCodeRepository } from './auth-code.repository';
import { AuthCodeScheduler } from './auth-code.scheduler';

@Module({
  providers: [AuthCodeManager, AuthCodeRepository, AuthCodeScheduler],
  exports: [AuthCodeManager, AuthCodeRepository, AuthCodeScheduler],
})
export class AuthCodeModule {}
