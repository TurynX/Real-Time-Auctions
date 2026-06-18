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

@WebSocketGateway({
  cors: { origin: '*' },
})
export class AuctionGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly placeBidUseCase: PlaceBidUseCase) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join_auction')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    client.join(data.auctionId);
    const userId = client['user'].sub;
    this.server.except(client.id).to(data.auctionId).emit('user_joined', {
      userId,
      message: 'User joined the auction',
    });
  }

  @UseGuards(WsAuthGuard)
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
      }
    } catch (error: any) {
      console.log(error);
      client.emit('bid_failed', error.response.message);
    }
  }
}
