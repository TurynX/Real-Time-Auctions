import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'src/lib/prisma.service';

describe('Auction (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const generateUniqueUser = () => ({
    name: 'John Doe',
    email: `test+${Math.random().toString(36).substring(2, 11)}@gmail.com`,
    password: 'password123',
  });

  const auctionData = {
    title: 'test auction',
    description: 'test description',
    initialPrice: 100,
    endsAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
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

  afterAll(async () => {
    await app.close();
  });

  const generateToken = async (user: any) => {
    await request(app.getHttpServer()).post('/auth/register').send(user);
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(user);
    return response.body.data.accessToken;
  };

  it('should create an auction', async () => {
    const user = generateUniqueUser();
    const token = await generateToken(user);
    await request(app.getHttpServer())
      .post('/auction/create')
      .set('Authorization', `Bearer ${token}`)
      .send(auctionData)
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('description');
        expect(res.body.data).toHaveProperty('initialPrice');
        expect(res.body.data).toHaveProperty('currentPrice');
        expect(res.body.data).toHaveProperty('status');
        expect(res.body.data).toHaveProperty('creatorId');
        expect(res.body.data).toHaveProperty('endsAt');
        expect(res.body.data).toHaveProperty('createdAt');
      });
  });

  it('should not create an auction with invalid data', async () => {
    const user = generateUniqueUser();
    const token = await generateToken(user);
    const response = await request(app.getHttpServer())
      .post('/auction/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test auction',
        description: 'test description',
        initialPrice: -100,
        endsAt: new Date(
          new Date().getTime() + 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain('Initial price must be at least 1');
      });
  });

  it('should not create an auction with invalid date', async () => {
    const user = generateUniqueUser();
    const token = await generateToken(user);
    await request(app.getHttpServer())
      .post('/auction/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'test auction',
        description: 'test description',
        initialPrice: 100,
        endsAt: new Date().toISOString(),
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toContain(
          'End date must be at least 30 minutes of duration.',
        );
      });
  });
  it('should return all active auctions', async () => {
    const user = generateUniqueUser();
    const token = await generateToken(user);
    await request(app.getHttpServer())
      .post('/auction/create')
      .set('Authorization', `Bearer ${token}`)
      .send(auctionData);
    const response = await request(app.getHttpServer())
      .get('/auction')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body).toHaveProperty('data');

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('title');
    expect(response.body.data[0]).toHaveProperty('description');
    expect(response.body.data[0]).toHaveProperty('initialPrice');
    expect(response.body.data[0]).toHaveProperty('currentPrice');
    expect(response.body.data[0]).toHaveProperty('status');
    expect(response.body.data[0]).toHaveProperty('creatorId');
    expect(response.body.data[0]).toHaveProperty('endsAt');
    expect(response.body.data[0]).toHaveProperty('createdAt');
  });
});
