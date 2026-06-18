import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuctionModule } from './auction/auction.module';
import { PrismaModule } from './lib/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuctionModule, AuthModule, PrismaModule, ScheduleModule.forRoot()],
})
export class AppModule {}
