import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Body, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);
    return { data: user };
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.login(body);
    return { data: user };
  }
}
