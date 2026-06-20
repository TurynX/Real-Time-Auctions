import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Initial price must be at least 1' })
  initialPrice: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endsAt: Date;
}
