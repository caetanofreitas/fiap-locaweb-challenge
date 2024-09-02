import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventsService } from 'events/service';
import { Response } from 'express';
import { EventModel } from 'models/Event';
import { GetCurrentUserToken } from 'shared/decorators';

@ApiTags('Events')
@Controller('/event')
@ApiBearerAuth()
export class EventController {
  constructor(private readonly service: EventsService) {}

  @Get()
  async listEvents(@Res() res: Response, @GetCurrentUserToken() token: string) {
    try {
      Logger.log(`[GET] - /user/events`);
      const events = await this.service.GetEventsByUserId(token);
      if (events.length < 1) {
        return res.sendStatus(HttpStatus.NO_CONTENT);
      }
      return res.status(HttpStatus.OK).send(events);
    } catch (err) {
      Logger.error(
        `Fail to execute request /user/events: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Put('/sync')
  async syncEvents(
    @Res() res: Response,
    @GetCurrentUserToken() token: string,
    @Body() events: EventModel[],
  ) {
    try {
      Logger.log(`[GET] - /user/events/sync`);
      const evs = await this.service.SyncEvents(token, events);
      return res.status(HttpStatus.OK).send(evs);
    } catch (err) {
      Logger.error(
        `Fail to execute request /user/events/sync: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Post()
  async create(
    @Res() res: Response,
    @GetCurrentUserToken() token: string,
    @Body() event: EventModel,
  ) {
    try {
      Logger.log(`[POST] - /event`);
      await this.service.CreateEvent(token, event);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(`Fail to execute request /event: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  @Put('/:id')
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
    @Body() body: EventModel,
  ) {
    try {
      Logger.log(`[PUT] - /event/:id`);
      body.id = id;
      await this.service.UpdateEvent(token, body);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /event/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Delete('/:id')
  async delete(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
  ) {
    try {
      Logger.log(`[DELETE] - /event/:id`);
      await this.service.DeleteEventById(token, id);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /event/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }
}
