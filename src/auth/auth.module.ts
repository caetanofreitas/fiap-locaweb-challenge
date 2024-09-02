import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModel } from 'models/User';
import { SessionModel } from 'models/Session';

import { AuthController } from './http';
import { AuthService } from './services';
import { AuthRepository, UserRepository } from './repository';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserModel, SessionModel]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, UserRepository],
  exports: [AuthService],
})
export class AuthModule {}
