import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionRepository } from './repositories/auction.repo';
import { AUCTION_REPOSITORY } from './repositories/auction.repo.interface';
import { AuthModule } from 'src/auth/auth.module';
import * as useCases from './use-case';
import { AuctionGateway } from './gateways/auction.gateway';
import { AuctionCronService } from './auction-cron.service';

@Module({
  imports: [AuthModule],
  controllers: [AuctionController],
  providers: [
    AuctionGateway,
    AuctionCronService,
    AuctionService,
    ...Object.values(useCases),
    { provide: AUCTION_REPOSITORY, useClass: AuctionRepository },
  ],
})
export class AuctionModule {}
