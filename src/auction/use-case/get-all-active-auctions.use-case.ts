import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import {
  AUCTION_REPOSITORY,
  type IAuctionRepository,
} from '../repositories/auction.repo.interface';

@Injectable()
export class GetAllActiveAuctionsUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepository: IAuctionRepository,
  ) {}

  async execute(): Promise<Auction[]> {
    const auctions = await this.auctionRepository.findAllActive();
    if (!auctions || auctions.length === 0) {
      throw new NotFoundException('No active auctions found.');
    }
    return auctions;
  }
}
