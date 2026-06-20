import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('auction')
@UseGuards(AuthGuard)
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('/create')
  async create(@Body() createAuctionDto: CreateAuctionDto, @Req() req) {
    const userId = req.user.sub;
    const auction = await this.auctionService.create(createAuctionDto, userId);
    return { data: auction };
  }

  @Get()
  async findAll() {
    const auction = await this.auctionService.findAll();
    return { data: auction };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const auction = await this.auctionService.findOne(id);
    return { data: auction };
  }

  @Post('bid')
  async placeBid(@Body() placeBidDto: PlaceBidDto, @Req() req) {
    const userId = req.user.sub;
    const bid = await this.auctionService.placeBid(placeBidDto, userId);
    return { data: bid };
  }
}
