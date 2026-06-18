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
  create(@Body() createAuctionDto: CreateAuctionDto, @Req() req) {
    const userId = req.user.sub;
    return this.auctionService.create(createAuctionDto, userId);
  }

  @Get()
  findAll() {
    return this.auctionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionService.findOne(id);
  }

  @Post('bid')
  placeBid(@Body() placeBidDto: PlaceBidDto, @Req() req) {
    const userId = req.user.sub;
    return this.auctionService.placeBid(placeBidDto, userId);
  }
}
