import { Test, TestingModule } from '@nestjs/testing';
import { PhoneAuthController } from './phone-auth.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PhoneAuthService } from './phone-auth.service';
import { IssueAuthCodeRequest } from './dto/issueAuthCodeRequest';
import { BadRequestException } from 'src/exception/bad-request.exception';
import { ErrorCodes } from 'src/exception/error.code';
import { AuthCodeManager } from './auth-code/auth-code.manager';
import { AuthCodeRepository } from './auth-code/auth-code.repository';

describe('PhoneAuthController', () => {
  let phoneAuthController: PhoneAuthController;
  let phoneAuthService: DeepMockProxy<PhoneAuthService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneAuthController],
      providers: [
        {
          provide: PhoneAuthService,
          useValue: mockDeep<PhoneAuthService>(),
        },
        {
          provide: AuthCodeManager,
          useValue: mockDeep<AuthCodeManager>(),
        },
        {
          provide: AuthCodeRepository,
          useValue: mockDeep<AuthCodeRepository>(),
        },
      ],
    }).compile();
    phoneAuthController = module.get<PhoneAuthController>(PhoneAuthController);
    phoneAuthService = module.get(PhoneAuthService);
  });
  describe('issuePhoneAuthCode', () => {
    it('인증코드 발급을 실패한다', async () => {
      const request: IssueAuthCodeRequest = {
        phoneNumber: '0101234567',
      };
      phoneAuthService.issuePhoneAuthCode.mockRejectedValue(new BadRequestException(ErrorCodes.INVALID_PHONE_NUMBER));
      await expect(phoneAuthController.issuePhoneAuthCode(request)).rejects.toThrow(new BadRequestException(ErrorCodes.INVALID_PHONE_NUMBER));
    });
    it('인증코드 발급을 성공한다', async () => {
      const request: IssueAuthCodeRequest = {
        phoneNumber: '010-1234-1234',
      };
      phoneAuthService.issuePhoneAuthCode.mockResolvedValue('123456');
      const authCode = await phoneAuthController.issuePhoneAuthCode(request);
      expect(authCode.data).toBe('123456');
    });
  });
});
