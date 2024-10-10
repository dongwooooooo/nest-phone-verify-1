import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PhoneAuthModule } from './phone-auth/phone-auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PhoneAuthModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ScheduleModule.forRoot()],
  exports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
