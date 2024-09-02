import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IEventsRepository } from 'events/contracts';
import { EventModel } from 'models/Event';
import { BaseRepository } from 'shared/database';

@Injectable()
export class EventsRepository
  extends BaseRepository
  implements IEventsRepository
{
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getEventById(id: string): Promise<EventModel> {
    return this.getRepository(EventModel).findOne({
      select: [
        'id',
        'name',
        'description',
        'occurence_date',
        'repeat_all_days',
        'user',
      ],
      where: { id },
      relations: { user: true },
    });
  }

  async deleteEventById(id: string): Promise<boolean> {
    await this.getRepository(EventModel).delete(id);
    return true;
  }

  async createEvent(event: EventModel): Promise<boolean> {
    await this.getRepository(EventModel).save(event);
    return true;
  }

  async batchCreateEvents(events: EventModel[]): Promise<boolean> {
    await this.getRepository(EventModel).save(events);
    return true;
  }

  async batchDeleteEvents(ids: string[]): Promise<boolean> {
    await this.getRepository(EventModel).delete(ids);
    return true;
  }

  getEventsByUserId(id: string, _?: boolean): Promise<EventModel[]> {
    console.log(_);
    return this.getRepository(EventModel)
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.name',
        'e.description',
        'e.occurence_date',
        'e.repeat_all_days',
      ])
      .where('e.user = :id', {
        id,
      })
      .getMany();
  }
}
