import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';

const extractToken = (req: Request): string | null => {
  const basic = req?.headers?.authorization;
  return !basic
    ? null
    : jwt.sign(
        basic.replace('Bearer ', ''),
        process.env.PRIVATE_SECRET || 'PRIVATE_SECRET',
      );
};

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: extractToken,
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_SECRET || 'PRIVATE_SECRET',
    });
  }

  async validate(payload: unknown) {
    return payload;
  }
}
