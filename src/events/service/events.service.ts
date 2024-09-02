import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from 'auth/services';
import { IEventsService } from 'events/contracts';
import { EventsRepository } from 'events/repository';
import { EventModel } from 'models/Event';

@Injectable()
export class EventsService implements IEventsService {
  constructor(
    private readonly repo: EventsRepository,
    private readonly authService: AuthService,
  ) {}

  async UpdateEvent(token: string, body: EventModel): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const event = await this.repo.getEventById(body.id);
    if (!event) throw new NotFoundException();

    if (event?.user?.id != user.id) throw new ForbiddenException();

    body = {
      ...event,
      ...body,
    };
    body.user = user;
    await this.repo.createEvent(body);
    return true;
  }

  async DeleteEventById(token: string, id: string): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const event = await this.repo.getEventById(id);
    if (!event) throw new NotFoundException();

    if (event?.user?.id != user.id) throw new ForbiddenException();

    return this.repo.deleteEventById(id);
  }

  async CreateEvent(token: string, event: EventModel): Promise<boolean> {
    const user = await this.authService.validateUser(token);

    event.user = user;

    return this.repo.createEvent(event);
  }

  async SyncEvents(token: string, events: EventModel[]): Promise<EventModel[]> {
    const user = await this.authService.validateUser(token);
    const eventsToRemove = [];
    const eventsToCreate = [];

    for (const event of events) {
      if (!event.id) {
        event.user = user;
        eventsToCreate.push(event);
        continue;
      }

      if (this.isOlder(event.occurence_date) && !event.repeat_all_days) {
        eventsToRemove.push(event.id);
      }
    }

    if (eventsToRemove.length > 0) {
      await this.repo.batchDeleteEvents(eventsToRemove);
    }

    if (eventsToCreate.length > 0) {
      await this.repo.batchCreateEvents(eventsToCreate);
    }

    const existentEvents = await this.repo.getEventsByUserId(user.id, true);

    return existentEvents;
  }

  async GetEventsByUserId(
    token: string,
    active?: boolean,
  ): Promise<EventModel[]> {
    const user = await this.authService.validateUser(token);
    return this.repo.getEventsByUserId(user.id, active);
  }

  private isOlder(utcDateString: string): boolean {
    const inputDate = new Date(utcDateString);
    const now = new Date();
    return inputDate < now;
  }
}
