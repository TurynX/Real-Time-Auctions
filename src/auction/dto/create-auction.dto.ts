import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
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
  @Min(1)
  @IsNotEmpty()
  inicialPrice: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endsAt: Date;
}
