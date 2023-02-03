import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';

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
    await app.listen(3333);

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
        .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user', () => {
        return pactum
        .spec()
        .get('/users/me',)
        .withHeaders({ 
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Chukwuma',
        email: 'chukwuma@gmail.com',
      };

      it('Should edit user', () => {
        return pactum
        .spec()
        .patch('/users',)
        .withHeaders({ 
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200);
      });
    });
  });
  
  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('Should get bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks',)
        .withHeaders({ 
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM'
      }

      it('Shoud create bookmark', () => {
        return pactum
        .spec()
        .post('/bookmarks',)
        .withHeaders({ 
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(201)
      })
    });

    describe('Get bookmarks ', () => {});

    describe('Get bookmark by id', () => {});

    describe('Edit bookmark by id', () => {});

    describe('Delete bookmark by id', () => {});
  });
});
