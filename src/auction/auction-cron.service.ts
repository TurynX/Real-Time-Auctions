import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  AUCTION_REPOSITORY,
  type IAuctionRepository,
} from './repositories/auction.repo.interface';
import { AuctionGateway } from './gateways/auction.gateway';

@Injectable()
export class AuctionCronService {
  private readonly logger = new Logger(AuctionCronService.name);

  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepo: IAuctionRepository,

    private readonly auctionGateway: AuctionGateway,
  ) {}

  @Cron('*/10 * * * * *')
  async handleExpiredAuctions() {
    this.logger.log('Executing expired auctions check...');

    try {
      const expiredAuctions = await this.auctionRepo.findExpiredAuctions(
        new Date(),
      );

      if (!expiredAuctions || expiredAuctions.length === 0) {
        return;
      }

      for (const auction of expiredAuctions) {
        this.logger.log(`Processing auction ${auction.id} closure`);

        await this.auctionRepo.updateAuctionStatus(auction.id, 'FINISHED');

        const winningBid = await this.auctionRepo.getHighestBid(auction.id);

        if (winningBid) {
          this.logger.log(
            `Auction ${auction.id} won by user ${winningBid.userId}`,
          );
        } else {
          this.logger.log(`Auction ${auction.id} ended without bids`);
        }

        this.auctionGateway.server.to(auction.id).emit('auction_finished', {
          auctionId: auction.id,
          winnerId: winningBid ? winningBid.userId : null,
          finalPrice: winningBid ? winningBid.amount : auction.currentPrice,
          message: 'This auction has ended!',
        });
      }
    } catch (error: any) {
      this.logger.error(error.message);
    }
  }
}
