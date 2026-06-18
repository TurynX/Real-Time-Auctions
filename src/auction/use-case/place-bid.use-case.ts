import { Injectable, Inject, ConflictException } from '@nestjs/common';
import {
  type IAuctionRepository,
  AUCTION_REPOSITORY,
} from '../repositories/auction.repo.interface';
import { PlaceBidDto } from '../dto/place-bid.dto';
import { Auction } from '../entities/auction.entity';

@Injectable()
export class PlaceBidUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepo: IAuctionRepository,
  ) {}

  async execute(data: PlaceBidDto, userId: string): Promise<Auction> {
    const auction = await this.auctionRepo.findByAuctionId(data.auctionId);

    if (!auction) {
      throw new ConflictException('Auction not found');
    }
    if (auction.status !== 'ACTIVE') {
      throw new ConflictException('Auction is not active');
    }
    console.log(auction.status);
    if (auction.creatorId === userId) {
      throw new ConflictException('You cannot bid on your own auction');
    }
    if (auction.currentPrice * 1.05 > data.amount) {
      throw new ConflictException('Bid amount is too low');
    }
    await this.auctionRepo.placeBid(data, userId);
    const updatedAuction = await this.auctionRepo.updateAuction(
      data.auctionId,
      data.amount,
    );

    return updatedAuction;
  }
}
