import { PrismaService } from '../prisma/prisma.service';
import { IssueAuthCodeRequest } from './dto/issueAuthCodeRequest';
import { VerifyAuthCodeRequest } from './dto/VerifyAuthCodeRequest';
import { ErrorCodes } from 'src/exception/error.code';
import { NotFoundException } from 'src/exception/not-found.exception';
import { GoneException } from 'src/exception/gone.exception';
import { BadRequestException } from 'src/exception/bad-request.exception';
import { Injectable } from '@nestjs/common';
import { AuthCodeRepository } from './auth-code/auth-code.repository';
import { AuthCodeManager } from './auth-code/auth-code.manager';
import { AuthCodeData } from './auth-code/authCodeData';

@Injectable()
export class PhoneAuthService {
  constructor(
    private readonly authCodeRepository: AuthCodeRepository,
    private readonly prismaService: PrismaService,
    private readonly authCodeManger: AuthCodeManager,
  ) {}

  async issuePhoneAuthCode(request: IssueAuthCodeRequest) {
    if (!validatePhoneNumber(request.phoneNumber)) {
      throw new BadRequestException(ErrorCodes.INVALID_PHONE_NUMBER);
    }
    const user = await this.prismaService.user
      .findUniqueOrThrow({
        where: { phoneNumber: request.phoneNumber },
      })
      .catch(() => {
        throw new NotFoundException(ErrorCodes.USER_NOT_FOUND);
      });

    const authCode = this.authCodeManger.generateAuthCode();
    const expiredAt = this.authCodeManger.getExpirationDate();
    const existingAuthCodeData = this.authCodeRepository.findAuthCode(user.phoneNumber);
    if (existingAuthCodeData) {
      existingAuthCodeData.code = authCode;
      existingAuthCodeData.expiredAt = expiredAt;
    } else {
      this.authCodeRepository.saveAuthCode(user.phoneNumber, new AuthCodeData(authCode, expiredAt));
    }
    return authCode;
  }

  async verifyPhoneAuthCode(request: VerifyAuthCodeRequest) {
    if (!validatePhoneNumber(request.phoneNumber)) {
      throw new BadRequestException(ErrorCodes.INVALID_PHONE_NUMBER);
    }
    const authCodeData = this.authCodeRepository.findAuthCode(request.phoneNumber);
    if (!authCodeData) {
      throw new NotFoundException(ErrorCodes.AUTH_CODE_NOT_FOUND);
    }
    if (authCodeData.code !== request.authCode) {
      throw new BadRequestException(ErrorCodes.INVALID_AUTH_CODE);
    }
    if (authCodeData.expiredAt < new Date()) {
      throw new GoneException(ErrorCodes.AUTH_CODE_EXPIRED);
    }
    this.authCodeRepository.deleteAuthCode(request.phoneNumber);
  }

  async signUp() {
    await this.prismaService.user.create({
      data: {
        name: 'dongwoo',
        phoneNumber: '010-1234-1234',
      },
    });
  }
}
function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
}
