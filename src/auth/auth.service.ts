import { Injectable } from '@nestjs/common';
import { LoginResponse, RegisterResponse } from './entities/auth.entities';
import { RegisterUseCase } from './use-case/register.use-case';
import { LoginUseCase } from './use-case/login.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async register(data: any): Promise<RegisterResponse> {
    return this.registerUseCase.execute(data);
  }

  async login(data: any): Promise<LoginResponse> {
    return this.loginUseCase.execute(data);
  }
}
