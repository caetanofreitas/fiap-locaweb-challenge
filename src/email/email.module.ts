import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { EmailModel } from 'models/Email';
import { MessageModel } from 'models/Message';
import { EmailController } from './http';
import { EmailService } from './services/email.service';
import { EmailRepository } from './repository';
import { UserModule } from 'user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailModel, MessageModel]),
    AuthModule,
    UserModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailRepository],
})
export class EmailModule {}
