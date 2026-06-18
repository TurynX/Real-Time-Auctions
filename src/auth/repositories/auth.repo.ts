import { IAuthRepository } from './auth.repo.interface';
import { PrismaService } from '../../lib/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  FindByEmailResponse,
  RegisterResponse,
} from '../entities/auth.entities';
import { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: RegisterDto): Promise<RegisterResponse> {
    const user = await this.prisma.user.create({
      data,
    });

    return new RegisterResponse(user.id, user.email, user.name);
  }

  async findByEmail(email: string): Promise<FindByEmailResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) return null;
    return new FindByEmailResponse(
      user.id,
      user.email,
      user.name,
      user.password,
    );
  }
}
