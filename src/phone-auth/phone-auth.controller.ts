import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PhoneAuthService } from './phone-auth.service';
import { IssueAuthCodeRequest } from './dto/issueAuthCodeRequest';
import { VerifyAuthCodeRequest } from './dto/VerifyAuthCodeRequest';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('/phone-auth')
export class PhoneAuthController {
  constructor(private readonly phoneAuthService: PhoneAuthService) {}

  @Post('/issue')
  @ApiOperation({ summary: '휴대폰 인증번호 발급' })
  @ApiBody({ type: IssueAuthCodeRequest })
  @ApiResponse({ status: 201, description: '인증번호 발급 성공', schema: { example: { data: '123456' } } })
  async issuePhoneAuthCode(@Body() request: IssueAuthCodeRequest) {
    const authCode = await this.phoneAuthService.issuePhoneAuthCode(request);
    return { data: authCode };
  }
  @Post('/auth/phone/verify')
  @HttpCode(200)
  @ApiOperation({ summary: '인증번호 확인' })
  @ApiBody({ type: VerifyAuthCodeRequest })
  @ApiResponse({ status: 200, description: '인증 성공' })
  async verifyPhoneAuthCode(@Body() request: VerifyAuthCodeRequest) {
    await this.phoneAuthService.verifyPhoneAuthCode(request);
    return HttpStatus.OK;
  }

  @Get('/signup')
  @HttpCode(200)
  async signUp() {
    this.phoneAuthService.signUp();
  }
}
