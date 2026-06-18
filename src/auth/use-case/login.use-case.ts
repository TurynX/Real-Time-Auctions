import { UnauthorizedException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { LoginDto } from '../dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import type { IAuthRepository } from '../repositories/auth.repo.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('AUTH_REPOSITORY') private readonly authRepo: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
    };
  }
}
