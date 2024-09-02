import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsService } from './service';
import { EventsRepository } from './repository';
import { EventModel } from 'models/Event';
import { EventController } from './http';
import { AuthModule } from 'auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventModel]), AuthModule],
  controllers: [EventController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
