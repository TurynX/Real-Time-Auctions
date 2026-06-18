import { RegisterDto } from '../dto/auth.dto';
import * as argon2 from 'argon2';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { IAuthRepository } from '../repositories/auth.repo.interface';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('AUTH_REPOSITORY') private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: RegisterDto) {
    const { email, password, name } = dto;

    const isEmailRegistered = await this.authRepository.findByEmail(email);

    if (isEmailRegistered) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hashedPassword = await argon2.hash(password);

    return this.authRepository.register({
      email,
      password: hashedPassword,
      name,
    });
  }
}
