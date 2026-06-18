import { Injectable } from '@nestjs/common';

//DTO's
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';

//Use Cases
import {
  CreateAuctionUseCase,
  GetAllActiveAuctionsUseCase,
  GetAuctionByIdUseCase,
  PlaceBidUseCase,
} from './use-case';

@Injectable()
export class AuctionService {
  constructor(
    private readonly createAuctionUseCase: CreateAuctionUseCase,
    private readonly getAllActiveAuctionsUseCase: GetAllActiveAuctionsUseCase,
    private readonly getAuctionByIdUseCase: GetAuctionByIdUseCase,
    private readonly placeBidUseCase: PlaceBidUseCase,
  ) {}

  create(createAuctionDto: CreateAuctionDto, userId: string) {
    return this.createAuctionUseCase.execute(createAuctionDto, userId);
  }

  findAll() {
    return this.getAllActiveAuctionsUseCase.execute();
  }

  findOne(id: string) {
    return this.getAuctionByIdUseCase.execute(id);
  }

  placeBid(placeBidDto: PlaceBidDto, userId: string) {
    return this.placeBidUseCase.execute(placeBidDto, userId);
  }
}
