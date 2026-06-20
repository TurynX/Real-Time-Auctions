import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  type IAuctionRepository,
  AUCTION_REPOSITORY,
} from '../repositories/auction.repo.interface';
import { PlaceBidDto } from '../dto/place-bid.dto';
import { Auction } from '../entities/auction.entity';

export interface PlaceBidResponse {
  auction: Auction;
  lastUserIdBid: string | null | undefined;
}
@Injectable()
export class PlaceBidUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepo: IAuctionRepository,
  ) {}

  async execute(data: PlaceBidDto, userId: string): Promise<PlaceBidResponse> {
    const auction = await this.auctionRepo.findByAuctionId(data.auctionId);

    if (!auction) {
      throw new ConflictException('Auction not found');
    }
    if (auction.status !== 'ACTIVE') {
      throw new ConflictException('Auction is not active');
    }

    if (auction.creatorId === userId) {
      throw new ConflictException('You cannot bid on your own auction');
    }
    if (auction.currentPrice * 1.05 > data.amount) {
      throw new ConflictException('Bid amount is too low');
    }
    const lastUserIdBid = auction.lastBidUserId;
    if (!lastUserIdBid) {
      null;
    }

    await this.auctionRepo.placeBid(data, userId);
    const updatedAuction = await this.auctionRepo.updateAuction(data, userId);

    return {
      auction: updatedAuction,
      lastUserIdBid,
    };
  }
}
