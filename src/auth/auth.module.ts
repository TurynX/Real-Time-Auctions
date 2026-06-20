import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as useCases from './use-case';
import { AuthRepository } from './repositories/auth.repo';
import { PrismaService } from 'src/lib/prisma.service';
import { AUTH_REPOSITORY } from './repositories/auth.repo.interface';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...Object.values(useCases),
    AuthGuard,
    PrismaService,
    { provide: AUTH_REPOSITORY, useClass: AuthRepository },
  ],
  exports: [AuthGuard, JwtModule, AUTH_REPOSITORY],
})
export class AuthModule {}
