import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PlaceBidUseCase } from '../use-case/place-bid.use-case';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/auth/guards/ws.guard';
import { GetAuctionBidsHistoryUseCase } from '../use-case/get-auction-bids-history.use-case';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsAuthGuard)
export class AuctionGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly placeBidUseCase: PlaceBidUseCase,
    private readonly getAuctionBidsHistoryUseCase: GetAuctionBidsHistoryUseCase,
  ) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @SubscribeMessage('join_auction')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    client.join(data.auctionId);

    try {
      const historyBids = await this.getAuctionBidsHistoryUseCase.execute(
        data.auctionId,
      );
      this.server.to(data.auctionId).emit('bids_history', historyBids);
      const userId = client['user'].sub;

      this.server.except(client.id).to(data.auctionId).emit('user_joined', {
        userId,
        message: 'User joined the auction',
      });
    } catch (error: any) {
      client.emit('bid_failed', error.response.message);
    }
  }

  @SubscribeMessage('place_bid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; amount: number },
  ) {
    try {
      const userId = client['user'].sub;

      const updatedAuction = await this.placeBidUseCase.execute(data, userId);

      if (updatedAuction) {
        this.server.to(data.auctionId).emit('bid_updated', updatedAuction);

        if (updatedAuction.lastUserIdBid) {
          this.server.except(client.id).to(data.auctionId).emit('outbid', {
            message: `You have been outbid on the auction`,
          });
        }
      }
    } catch (error: any) {
      client.emit('bid_failed', error.response.message);
    }
  }
}
