import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuctionModule } from './auction/auction.module';
import { PrismaModule } from './lib/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    AuctionModule,
    AuthModule,
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
