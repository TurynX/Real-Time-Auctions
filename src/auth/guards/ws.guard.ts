import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();

    const handshakeHeaders = client?.handshake?.headers;
    const handshakeAuth = client?.handshake?.auth;

    const token =
      this.extractToken(handshakeHeaders) || this.extractToken(handshakeAuth);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido no WebSocket');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client['user'] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Token inválido no WebSocket');
    }

    return true;
  }

  private extractToken(obj: any): string | undefined {
    if (!obj) return undefined;

    const authorization = obj.authorization || obj.Authorization || obj.token;
    if (!authorization) return undefined;

    if (authorization.startsWith('Bearer ')) {
      return authorization.split(' ')[1];
    }

    return authorization;
  }
}
