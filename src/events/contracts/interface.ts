import { EventModel } from 'models/Event';

export interface IEventsService {
  GetEventsByUserId(id: string, active?: boolean): Promise<EventModel[]>;
  DeleteEventById(token: string, id: string): Promise<boolean>;
  CreateEvent(token: string, event: EventModel): Promise<boolean>;
  SyncEvents(token: string, events: EventModel[]): Promise<EventModel[]>;
  UpdateEvent(token: string, event: EventModel): Promise<boolean>;
}

export interface IEventsRepository {
  getEventById(id: string): Promise<EventModel>;
  getEventsByUserId(id: string, active?: boolean): Promise<EventModel[]>;
  deleteEventById(id: string): Promise<boolean>;
  createEvent(event: EventModel): Promise<boolean>;
  batchCreateEvents(events: EventModel[]): Promise<boolean>;
  batchDeleteEvents(ids: string[]): Promise<boolean>;
}
