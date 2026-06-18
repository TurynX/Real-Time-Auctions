import { CreateAuctionDto } from '../dto/create-auction.dto';
import { PlaceBidDto } from '../dto/place-bid.dto';
import { Auction, Bid } from '../entities/auction.entity';

export interface IAuctionRepository {
  create(data: CreateAuctionDto, userId: string): Promise<Auction>;
  findAllActive(): Promise<Auction[]>;
  updateAuction(auctionId: string, amount: number): Promise<Auction>;
  findByAuctionId(auctionId: string): Promise<Auction | null>;
  placeBid(data: PlaceBidDto, userId: string): Promise<Bid>;
  findByUserId(userId: string): Promise<Auction[]>;
  findExpiredAuctions(now: Date): Promise<Auction[]>;
  getHighestBid(auctionId: string): Promise<Bid | null>;
  updateAuctionStatus(auctionId: string, status: string): Promise<void>;
}

export const AUCTION_REPOSITORY = 'AUCTION_REPOSITORY';
