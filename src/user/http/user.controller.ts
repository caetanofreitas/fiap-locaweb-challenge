import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Put,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetCurrentUserToken } from 'shared/decorators';
import { UserPreferencesBody } from 'user/contracts';
import { UserService } from 'user/services';

@ApiTags('User')
@Controller('/user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('/info')
  async info(@Res() res: Response, @GetCurrentUserToken() token: string) {
    try {
      Logger.log(`[GET] - /user/info`);
      const user = await this.service.GetInfo(token);
      return res.status(HttpStatus.OK).send(user);
    } catch (err) {
      Logger.error(
        `Fail to execute request /user/info: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Put('/preferences')
  async updatePreferences(
    @Res() res: Response,
    @GetCurrentUserToken() token: string,
    @Body() body: UserPreferencesBody,
  ) {
    try {
      Logger.log(`[PUT] - /user/preferences`);
      await this.service.UpsertPreferences(
        token,
        UserPreferencesBody.ToModel(body),
      );
      return res.sendStatus(HttpStatus.NO_CONTENT);
    } catch (err) {
      Logger.error(
        `Fail to execute request /user/preferences: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }
}
