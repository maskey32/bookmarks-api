import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async  () => { 
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }),
    );
    await app.init();
    await app.listen(3334);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'michael@gmail.com',
      password: '12345',
    };

    describe('Signup', () => {
      it('Should throw exceptiion if email empty', () => {
        return pactum
        .spec()
        .post('/auth/signup',)
        .withBody({
          password: dto.password,
        })
        .expectStatus(400)
      });

      it('Should throw exceptiion if password empty', () => {
        return pactum
        .spec()
        .post('/auth/signup',)
        .withBody({
          email: dto.email,
        })
        .expectStatus(400)
      });

      it('Should throw exceptiion if body empty', () => {
        return pactum
        .spec()
        .post('/auth/signup',)
        .expectStatus(400)
      });

      it('Should signup', () => {
        return pactum
        .spec()
        .post('/auth/signup',)
        .withBody(dto)
        .expectStatus(201)
      });
    });
    
    describe('Signin', () => {
      it('Should throw exceptiion if email empty', () => {
        return pactum
        .spec()
        .post('/auth/signin',)
        .withBody({
          password: dto.password,
        })
        .expectStatus(400)
      });

      it('Should throw exceptiion if password empty', () => {
        return pactum
        .spec()
        .post('/auth/signin',)
        .withBody({
          email: dto.email,
        })
        .expectStatus(400)
      });

      it('Should throw exceptiion if body empty', () => {
        return pactum
        .spec()
        .post('/auth/signin',)
        .expectStatus(400)
      });

      it('Should signin', () => {
        return pactum
        .spec()
        .post('/auth/signin',)
        .withBody(dto)
        .expectStatus(200)
      });
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {});

    describe('Edit user', () => {});
  });
  
  describe('Bookmark', () => {
    describe('Create bookmark', () => {});

    describe('Get bookmarks ', () => {});

    describe('Get bookmark by id', () => {});

    describe('Edit bookmark', () => {});

    describe('Delete bookmark', () => {});
  });
});
