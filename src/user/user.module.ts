import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './http';
import { UserService } from './services';
import { UserRepository } from './repository';
import { AuthModule } from 'auth/auth.module';
import { UserModel } from 'models/User';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel]), AuthModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
