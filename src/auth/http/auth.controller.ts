import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { LoginDTO, RegisterDTO } from 'auth/contracts';
import { AuthService } from 'auth/services';
import { Public } from 'shared/decorators';

@ApiTags('Auth')
@Controller('/auth')
@Public()
export class AuthController {
  constructor(private readonly srv: AuthService) {}

  @Post('/login')
  async login(@Res() res: Response, @Body() body: LoginDTO) {
    try {
      Logger.log(`[POST] - /auth/login | ${JSON.stringify(body)}`);
      const tk = await this.srv.login(body.email, body.password);
      return res
        .status(HttpStatus.OK)
        .appendHeader('Authorization', `Bearer ${tk}`)
        .send({ token: tk });
    } catch (err) {
      Logger.error(
        `Fail to execute request /auth/login: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }

  @Post('/register')
  async register(@Res() res: Response, @Body() body: RegisterDTO) {
    try {
      Logger.log(`[POST] - /auth/register | ${JSON.stringify(body)}`);
      const tk = await this.srv.register(body);
      return res
        .status(HttpStatus.CREATED)
        .appendHeader('Authorization', `Bearer ${tk}`)
        .send({ token: tk });
    } catch (err) {
      Logger.error(
        `Fail to execute request /auth/register: ${JSON.stringify(err)}`,
      );
      throw err;
    }
  }
}
