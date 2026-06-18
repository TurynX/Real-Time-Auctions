import { Injectable } from '@nestjs/common';
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
        initialPrice: data.inicialPrice,
        currentPrice: data.inicialPrice,
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
      );
    });
  }

  async updateAuction(auctionId: string, amount: number): Promise<Auction> {
    const auction = await this.prisma.auction.update({
      where: {
        id: auctionId,
      },
      data: {
        currentPrice: amount,
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
      auction.winnerId,
    );
  }

  async findByAuctionId(auctionId: string): Promise<Auction | null> {
    const auction = await this.prisma.auction.findUnique({
      where: {
        id: auctionId,
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
      auction.winnerId,
    );
  }

  async placeBid(data: PlaceBidDto, userId: string): Promise<Bid> {
    const bid = await this.prisma.bid.create({
      data: {
        amount: data.amount,
        auctionId: data.auctionId,
        userId: userId,
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

  async updateAuctionStatus(
    auctionId: string,
    status: AuctionStatus,
  ): Promise<void> {
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: { status },
    });
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
