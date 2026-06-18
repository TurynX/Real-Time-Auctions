import { Type } from 'class-transformer';
import { IsString, Min, IsNumber } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  readonly auctionId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly amount: number;
}
