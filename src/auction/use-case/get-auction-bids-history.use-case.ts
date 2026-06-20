import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IAuctionRepository,
  AUCTION_REPOSITORY,
} from '../repositories/auction.repo.interface';

@Injectable()
export class GetAuctionBidsHistoryUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepository: IAuctionRepository,
  ) {}

  async execute(auctionId: string) {
    const auction = await this.auctionRepository.findByAuctionId(auctionId);

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    const bidsHistory =
      await this.auctionRepository.getAuctionBidsHistory(auctionId);

    if (!bidsHistory) {
      throw new NotFoundException('Bids not found');
    }

    return { bidsHistory };
  }
}
