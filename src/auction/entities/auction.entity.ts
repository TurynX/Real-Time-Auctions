export class Auction {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly initialPrice: number,
    public readonly currentPrice: number,
    public readonly status: 'ACTIVE' | 'FINISHED' | 'CANCELED',
    public readonly creatorId: string,
    public readonly endsAt: Date,
    public readonly createdAt: Date,
    public readonly lastBidUserId?: string | null,
    public readonly winnerId?: string | null,
  ) {}
}

export class Bid {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly userId: string,
    public readonly auctionId: string,
    public readonly createdAt: Date,
  ) {}
}
