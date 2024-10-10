import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IssueAuthCodeRequest {
  @ApiProperty({ example: '010-1234-1234', description: '휴대폰 번호' })
  @IsString()
  readonly phoneNumber: string;
}
