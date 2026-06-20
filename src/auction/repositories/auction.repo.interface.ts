import { CreateAuctionDto } from '../dto/create-auction.dto';
import { Auction, Bid } from '../entities/auction.entity';
import { PlaceBidDto } from '../dto/place-bid.dto';

export interface IAuctionRepository {
  create(data: CreateAuctionDto, userId: string): Promise<Auction>;
  findAllActive(): Promise<Auction[]>;
  updateAuction(data: PlaceBidDto, userId: string): Promise<Auction>;
  findByAuctionId(auctionId: string): Promise<Auction | null>;
  findByUserId(userId: string): Promise<Auction[]>;
  findExpiredAuctions(now: Date): Promise<Auction[]>;
  placeBid(data: PlaceBidDto, userId: string): Promise<Bid>;
  getHighestBid(auctionId: string): Promise<Bid | null>;
  updateAuctionStatus(auctionId: string, status: string): Promise<void>;
  getAuctionBidsHistory(auctionId: string): Promise<Bid[]>;
}

export const AUCTION_REPOSITORY = 'AUCTION_REPOSITORY';
