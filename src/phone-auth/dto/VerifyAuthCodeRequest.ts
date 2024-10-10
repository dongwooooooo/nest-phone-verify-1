import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyAuthCodeRequest {
  @ApiProperty({ example: '010-1234-1234', description: '휴대폰 번호' })
  @IsString()
  readonly phoneNumber: string;
  @ApiProperty({ example: '123456', description: '인증 코드' })
  @IsString()
  readonly authCode: string;
}
