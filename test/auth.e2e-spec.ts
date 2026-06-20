import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/lib/prisma.service';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const generateUniqueUser = () => ({
    name: 'John Doe',
    email: `test+${Math.random().toString(36).substring(2, 11)}@gmail.com`,
    password: 'password123',
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    await prisma.bid.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    await prisma.bid.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should register a new user', () => {
    const user = generateUniqueUser();
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', user.name);
        expect(res.body.data).toHaveProperty('email', user.email);
      });
  });

  it('should not register a new user with an existing email', async () => {
    const user = generateUniqueUser();
    await request(app.getHttpServer()).post('/auth/register').send(user);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(401)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });
  });

  it('should login with correct credentials', async () => {
    const user = generateUniqueUser();
    await request(app.getHttpServer()).post('/auth/register').send(user);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('accessToken');
      });
  });

  it('should not login with wrong credentials', async () => {
    const user = generateUniqueUser();
    await request(app.getHttpServer()).post('/auth/register').send(user);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrongpassword' })
      .expect(401)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
