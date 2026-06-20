import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { IAuctionRepository } from './auction.repo.interface';
import { CreateAuctionDto } from '../dto/create-auction.dto';
import { Auction, Bid } from '../entities/auction.entity';
import { PlaceBidDto } from '../dto/place-bid.dto';
import { PrismaService } from '../../lib/prisma.service';
import { AuctionStatus } from '@prisma/client';

@Injectable()
export class AuctionRepository implements IAuctionRepository {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateAuctionDto, userId: string): Promise<Auction> {
    const auction = await this.prisma.auction.create({
      data: {
        title: data.title,
        description: data.description,
        initialPrice: data.initialPrice,
        currentPrice: data.initialPrice,
        endsAt: data.endsAt,
        status: 'ACTIVE',
        creatorId: userId,
      },
    });
    return new Auction(
      auction.id,
      auction.title,
      auction.description!,
      auction.initialPrice,
      auction.currentPrice,
      auction.status,
      auction.creatorId,
      auction.endsAt,
      auction.createdAt,
    );
  }

  async findAllActive(): Promise<Auction[]> {
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    });
    return auctions.map((auction) => {
      return new Auction(
        auction.id,
        auction.title,
        auction.description!,
        auction.initialPrice,
        auction.currentPrice,
        auction.status,
        auction.creatorId,
        auction.endsAt,
        auction.createdAt,
        auction.bids[0]?.userId,
      );
    });
  }

  async updateAuction(data: PlaceBidDto, userId: string): Promise<Auction> {
    try {
      const auction = await this.prisma.auction.update({
        where: {
          id: data.auctionId,
        },
        data: {
          currentPrice: data.amount,
        },
      });

      if (!auction) {
        throw new Error('RACE_CONDITION_DETECTED');
      }
      return new Auction(
        auction.id,
        auction.title,
        auction.description!,
        auction.initialPrice,
        auction.currentPrice,
        auction.status,
        auction.creatorId,
        auction.endsAt,
        auction.createdAt,
        userId,
      );
    } catch (error) {
      if (error.message === 'RACE_CONDITION_DETECTED') {
        throw new ConflictException(
          'The auction price changed before your bid could be processed. Try again.',
        );
      }

      throw new InternalServerErrorException('Failed to process bid.');
    }
  }

  async getAuctionBidsHistory(auctionId: string): Promise<Bid[]> {
    const bids = await this.prisma.bid.findMany({
      where: {
        auctionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    return bids.map((bid) => {
      return new Bid(
        bid.id,
        bid.amount,
        bid.userId,
        bid.auctionId,
        bid.createdAt,
      );
    });
  }

  async findByAuctionId(auctionId: string): Promise<Auction | null> {
    const auction = await this.prisma.auction.findUnique({
      where: {
        id: auctionId,
      },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    });
    if (!auction) {
      return null;
    }

    return new Auction(
      auction.id,
      auction.title,
      auction.description!,
      auction.initialPrice,
      auction.currentPrice,
      auction.status,
      auction.creatorId,
      auction.endsAt,
      auction.createdAt,
      auction.bids[0]?.userId,
      auction.winnerId,
    );
  }
  async updateAuctionStatus(
    auctionId: string,
    status: AuctionStatus,
  ): Promise<void> {
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: { status },
    });
  }

  async findExpiredAuctions(now: Date): Promise<Auction[]> {
    const auctions = await this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { lt: now },
      },
    });
    return auctions.map((auction) => {
      return new Auction(
        auction.id,
        auction.title,
        auction.description!,
        auction.initialPrice,
        auction.currentPrice,
        auction.status,
        auction.creatorId,
        auction.endsAt,
        auction.createdAt,
        auction.winnerId,
      );
    });
  }

  async placeBid(data: PlaceBidDto, userId: string): Promise<Bid> {
    const bid = await this.prisma.bid.create({
      data: {
        amount: data.amount,
        userId,
        auctionId: data.auctionId,
      },
    });
    return new Bid(
      bid.id,
      bid.amount,
      bid.userId,
      bid.auctionId,
      bid.createdAt,
    );
  }

  async getHighestBid(auctionId: string): Promise<Bid | null> {
    const bid = await this.prisma.bid.findFirst({
      where: {
        auctionId,
      },
      orderBy: {
        amount: 'desc',
      },
    });
    if (!bid) {
      return null;
    }
    return new Bid(
      bid.id,
      bid.amount,
      bid.userId,
      bid.auctionId,
      bid.createdAt,
    );
  }

  async findByUserId(userId: string): Promise<Auction[]> {
    const auctions = await this.prisma.auction.findMany({
      where: {
        creatorId: userId,
      },
    });
    return auctions.map((auction) => {
      return new Auction(
        auction.id,
        auction.title,
        auction.description!,
        auction.initialPrice,
        auction.currentPrice,
        auction.status,
        auction.creatorId,
        auction.endsAt,
        auction.createdAt,
        auction.winnerId,
      );
    });
  }
}
