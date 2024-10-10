import { Test } from '@nestjs/testing';
import { PhoneAuthService } from './phone-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient, User } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { IssueAuthCodeRequest } from './dto/issueAuthCodeRequest';
import { VerifyAuthCodeRequest } from './dto/VerifyAuthCodeRequest';
import { NotFoundException } from 'src/exception/not-found.exception';
import { BadRequestException } from 'src/exception/bad-request.exception';
import { GoneException } from 'src/exception/gone.exception';
import { AuthCodeRepository } from './auth-code/auth-code.repository';
import { AuthCodeManager } from './auth-code/auth-code.manager';
import { AuthCodeData } from './auth-code/authCodeData';

describe('PhoneAuthService', () => {
  let phoneAuthService: PhoneAuthService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let authCodeRepository: DeepMockProxy<AuthCodeRepository>;
  let authCodeManager: DeepMockProxy<AuthCodeManager>;

  const mockUser: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'dongwoo',
    phoneNumber: '010-1234-1234',
    adminMemo: null,
    isDeleted: false,
    deletedAt: null,
  };

  beforeEach(async () => {
    prismaService = mockDeep<PrismaClient>();
    authCodeRepository = mockDeep<AuthCodeRepository>();
    authCodeManager = mockDeep<AuthCodeManager>();
    const testModuleRef = await Test.createTestingModule({
      providers: [PhoneAuthService, PrismaService, AuthCodeRepository, AuthCodeManager],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(AuthCodeRepository)
      .useValue(authCodeRepository)
      .overrideProvider(AuthCodeManager)
      .useValue(authCodeManager)
      .compile();
    phoneAuthService = testModuleRef.get(PhoneAuthService);
    authCodeManager = testModuleRef.get(AuthCodeManager);
    // mockAuthCodeManager.generateAuthCode.mockReturnValue('123456');
    // mockAuthCodeManager.getExpirationDate.mockReturnValue(new Date(Date.now() + 1000 * 60 * 5));
    authCodeRepository = testModuleRef.get(AuthCodeRepository);
  });

  describe('issuePhoneAuthCode', () => {
    it('인증 번호를 생성하고 반환한다.', async () => {
      prismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      authCodeManager.generateAuthCode.mockReturnValue('123456');
      const request: IssueAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
      };
      const authCode = await phoneAuthService.issuePhoneAuthCode(request);
      expect(authCode).toBeDefined();
      expect(authCode).toEqual('123456');
    });
    it('유효하지 않은 전화번호를 입력하면 에러를 반환한다.', async () => {
      prismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      const request: IssueAuthCodeRequest = {
        phoneNumber: '0101234123412',
      };
      await expect(phoneAuthService.issuePhoneAuthCode(request)).rejects.toThrow();
    });
    it('사용자가 존재하지 않으면 에러를 반환한다.', async () => {
      const request: IssueAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
      };
      prismaService.user.findUniqueOrThrow.mockRejectedValue(new Error('User not found'));
      await expect(phoneAuthService.issuePhoneAuthCode(request)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyPhoneAuthCode', () => {
    it('유효하지 않은 인증코드를 입력하면 에러를 반환한다.', async () => {
      const authCodeData = new AuthCodeData('123456', new Date(Date.now() + 1000 * 60 * 5));
      authCodeRepository.findAuthCode.mockReturnValue(authCodeData);
      const request: VerifyAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
        authCode: '123321',
      };
      await expect(phoneAuthService.verifyPhoneAuthCode(request)).rejects.toThrow(BadRequestException);
    });
    it('인증코드가 만료되면 에러를 반환한다.', async () => {
      const authCodeData = new AuthCodeData('123456', new Date(Date.now() - 1000 * 60 * 5));
      authCodeRepository.findAuthCode.mockReturnValue(authCodeData);
      const request: VerifyAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
        authCode: '123456',
      };
      await expect(phoneAuthService.verifyPhoneAuthCode(request)).rejects.toThrow(GoneException);
    });
    it('인증을 성공한다.', async () => {
      const authCodeData = new AuthCodeData('123456', new Date(Date.now() + 1000 * 60 * 5));
      authCodeRepository.findAuthCode.mockReturnValue(authCodeData);
      const request: VerifyAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
        authCode: '123456',
      };
      await phoneAuthService.verifyPhoneAuthCode(request);
      expect(undefined);
    });
  });
});
