import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { PhoneAuthModule } from './phone-auth.module';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthCodeModule } from './auth-code/auth-code.module';
import { AuthCodeRepository } from './auth-code/auth-code.repository';
import { AuthCodeData } from './auth-code/authCodeData';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PhoneAuthController e2e', () => {
  let app: INestApplication;
  let authCodeRepository: AuthCodeRepository;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PhoneAuthModule, PrismaModule, AuthCodeModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();
    app = module.createNestApplication();
    authCodeRepository = module.get<AuthCodeRepository>(AuthCodeRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    await app.init();
  });
  describe('phone-auth', () => {
    beforeEach(async () => {
      const authCode: AuthCodeData = {
        code: '123456',
        expiredAt: new Date(Date.now() + 1000 * 60 * 5),
      };
      authCodeRepository.saveAuthCode('010-1234-1234', authCode);
      await prismaService.user.create({
        data: {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'dongwoo',
          phoneNumber: '010-1234-1234',
          adminMemo: null,
          isDeleted: false,
          deletedAt: null,
        },
      });
    });
    afterEach(async () => {
      await prismaService.user.deleteMany();
      authCodeRepository.deleteAuthCode('010-1234-1234');
    });
    it('POST /phone-auth/issue 인증번호 발급을 성공힌다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/issue')
        .send({
          phoneNumber: '010-1234-1234',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveLength(6);
        });
    });
    it('POST /phone-auth/issue 유효하지 않은 휴대폰 양식으로 인증번호 발급을 실패한다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/issue')
        .send({
          phoneNumber: '012345678',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.code).toBe('P000');
          expect(res.body.message).toBe('휴대폰 번호가 올바르지 않습니다.');
        });
    });
    it('POST /phone-auth/issue 존재하지 않는 사용자로 인증번호 발급을 실패한다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/issue')
        .send({
          phoneNumber: '010-9876-9876',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.code).toBe('M004');
          expect(res.body.message).toBe('사용자를 찾을 수 없습니다.');
        });
    });
  });

  describe('phone-auth/verify', () => {
    beforeEach(async () => {
      const authCode: AuthCodeData = {
        code: '123456',
        expiredAt: new Date(Date.now() + 1000 * 60 * 5),
      };
      authCodeRepository.saveAuthCode('010-1234-1234', authCode);
      await prismaService.user.create({
        data: {
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'dongwoo',
          phoneNumber: '010-1234-1234',
          adminMemo: null,
          isDeleted: false,
          deletedAt: null,
        },
      });
    });
    afterEach(async () => {
      await prismaService.user.deleteMany();
      authCodeRepository.deleteAuthCode('010-1234-1234');
    });
    it('POST /phone-auth/auth/phone/verify 인증을 성공한다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/auth/phone/verify')
        .send({
          phoneNumber: '010-1234-1234',
          authCode: '123456',
        })
        .expect(200);
    });
    it('POST /phone-auth/auth/phone/verify 유효하지 않은 휴대폰 양식으로 인증을 실패한다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/auth/phone/verify')
        .send({
          phoneNumber: '012345678',
          authCode: '123456',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.code).toBe('P000');
          expect(res.body.message).toBe('휴대폰 번호가 올바르지 않습니다.');
        });
    });
    it('POST /phone-auth/auth/phone/verify 인증 코드가 일치하지 않아 인증을 실패한다.', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/auth/phone/verify')
        .send({
          phoneNumber: '010-1234-1234',
          authCode: '654321',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.code).toBe('P100');
          expect(res.body.message).toBe('인증 코드가 올바르지 않습니다.');
        });
    });
    it('POST /phone-auth/auth/phone/verify 인증 코드가 만료되어 인증 실패한다.', async () => {
      authCodeRepository.findAuthCode('010-1234-1234').expiredAt = new Date(Date.now() - 1000 * 60 * 5);
      return await request(app.getHttpServer())
        .post('/phone-auth/auth/phone/verify')
        .send({
          phoneNumber: '010-1234-1234',
          authCode: '123456',
        })
        .expect(410)
        .expect((res) => {
          expect(res.body.code).toBe('P010');
          expect(res.body.message).toBe('인증 코드가 만료되었습니다.');
        });
    });
    it('POST /phone-auth/auth/phone/verify 인증 코드를 찾을 수 없어 인증 실패', async () => {
      return await request(app.getHttpServer())
        .post('/phone-auth/auth/phone/verify')
        .send({
          phoneNumber: '010-9876-9876',
          code: '123456',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.code).toBe('P004');
          expect(res.body.message).toBe('인증 코드를 찾을 수 없습니다.');
        });
    });
  });
});
