import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateAuctionDto } from '../dto/create-auction.dto';
import type { IAuctionRepository } from '../repositories/auction.repo.interface';
import { Auction } from '../entities/auction.entity';
import { AUCTION_REPOSITORY } from '../repositories/auction.repo.interface';

@Injectable()
export class CreateAuctionUseCase {
  constructor(
    @Inject(AUCTION_REPOSITORY)
    private readonly auctionRepository: IAuctionRepository,
  ) {}
  async execute(data: CreateAuctionDto, userId: string): Promise<Auction> {
    const now = new Date();
    const endsAt = new Date(data.endsAt);

    const minDuration = 30 * 60 * 1000;
    const maxDuration = 7 * 24 * 60 * 60 * 1000;

    const duration = endsAt.getTime() - now.getTime();

    if (duration < minDuration) {
      throw new BadRequestException(
        'End date must be at least 30 minutes of duration.',
      );
    }

    if (duration > maxDuration) {
      throw new BadRequestException(
        'End date must not be more than 7 days of duration.',
      );
    }
    const auctionLimit = await this.auctionRepository.findByUserId(userId);

    if (auctionLimit.length >= 2) {
      throw new BadRequestException(
        'You can create only 2 auctions at a time.',
      );
    }

    return this.auctionRepository.create(data, userId);
  }
}
