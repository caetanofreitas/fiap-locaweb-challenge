import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmailBody, ListFilter } from 'email/contracts';
import { EmailService } from 'email/services/email.service';
import { Response } from 'express';
import { GetCurrentUserToken } from 'shared/decorators';

@ApiTags('Email')
@Controller('/email')
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly service: EmailService) {}

  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'markers', required: false })
  @ApiQuery({ name: 'read', required: false })
  @ApiQuery({ name: 'favorite', required: false })
  @ApiQuery({ name: 'importants', required: false })
  @ApiQuery({ name: 'archived', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  async listUserEmails(
    @Res() res: Response,
    @GetCurrentUserToken() token: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('date')
    date?: string,
    @Query('markers', new ParseArrayPipe({ optional: true, separator: ',' }))
    markers?: string[],
    @Query('read', new ParseBoolPipe({ optional: true })) read?: boolean,
    @Query('favorite', new ParseBoolPipe({ optional: true }))
    favorite?: boolean,
    @Query('importants', new ParseBoolPipe({ optional: true }))
    importants?: boolean,
    @Query('archived', new ParseBoolPipe({ optional: true }))
    archived?: boolean,
    @Query('search') search?: string,
  ) {
    try {
      Logger.log(`[GET] - /email`);
      const filters = new ListFilter();
      filters.page = page;
      filters.limit = limit;
      filters.date = date;
      filters.markers = markers;
      filters.read = read;
      filters.favorite = favorite;
      filters.importants = importants;
      filters.archived = archived;
      filters.search = search;
      const { emails, pages } = await this.service.ListEmails(token, filters);

      if (emails.length < 1) {
        return res.sendStatus(HttpStatus.NO_CONTENT);
      }

      return res.status(HttpStatus.OK).send({
        limit: filters.limit,
        page,
        pages,
        items: emails,
      });
    } catch (err) {
      Logger.error(`Fail to execute request /event: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  @Post()
  async sendNewEmail(
    @Res() res: Response,
    @Body() email: EmailBody,
    @GetCurrentUserToken() token: string,
  ) {
    try {
      Logger.log(`[POST] - /email`);
      await this.service.CreateEmail(token, email);
      return res.sendStatus(HttpStatus.CREATED);
    } catch (err) {
      Logger.error(`Fail to execute request /event: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  @Get('/:id')
  async getEmailDetail(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
  ) {
    try {
      Logger.log(`[GET] - /email/:id`);
      const email = await this.service.GetEmailDetail(token, id);
      return res.status(HttpStatus.OK).send(email);
    } catch (err) {
      Logger.error(
        `Fail to execute request /email/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Patch('/favorite/:id')
  async toggleFavoriteEmail(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
  ) {
    try {
      Logger.log(`[PATCH] - /email/favorite/:id`);
      await this.service.ToggleFavoriteEmail(token, id);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /email/favorite/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Patch('/archive/:id')
  async toggleArchivedEmail(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
  ) {
    try {
      Logger.log(`[PATCH] - /email/archive/:id`);
      await this.service.ToggleArchivedStatus(token, id);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /email/archive/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Patch('/read/:id')
  async setReadEmail(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
    @Body('status') status?: boolean,
  ) {
    try {
      Logger.log(`[PATCH] - /email/read/:id`);
      await this.service.SetReadStatus(token, id, status ?? true);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /email/read/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Patch('/markers/:id')
  async setMarkersEmail(
    @Res() res: Response,
    @Param('id') id: string,
    @GetCurrentUserToken() token: string,
    @Body('markers') markers: string[],
  ) {
    try {
      Logger.log(`[PATCH] - /email/markers/:id`);
      await this.service.UpdateEmailMarkers(token, id, markers ?? []);
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /email/markers/:id: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }
}
