import { Module } from '@nestjs/common';
import { PhoneAuthService } from './phone-auth.service';
import { PhoneAuthController } from './phone-auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthCodeModule } from './auth-code/auth-code.module';

@Module({
  imports: [PrismaModule, AuthCodeModule],
  controllers: [PhoneAuthController],
  providers: [PhoneAuthService],
})
export class PhoneAuthModule {}
