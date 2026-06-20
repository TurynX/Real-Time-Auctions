import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type IAuctionRepository,
  AUCTION_REPOSITORY,
} from '../repositories/auction.repo.interface';
import { Auction } from '../entities/auction.entity';

@Injectable()
export class GetAuctionByIdUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepo: IAuctionRepository,
  ) {}

  async execute(id: string): Promise<Auction> {
    const auction = await this.auctionRepo.findByAuctionId(id);

    console.log(auction);

    if (!auction) {
      throw new NotFoundException(`Auction with ID "${id}" not found`);
    }
    return auction;
  }
}
