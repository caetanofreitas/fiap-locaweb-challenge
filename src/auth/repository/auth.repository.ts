import { Inject, Injectable } from '@nestjs/common';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IAuthRepository } from 'auth/contracts';
import { SessionModel } from 'models/Session';
import { BaseRepository } from 'shared/database';

@Injectable()
export class AuthRepository extends BaseRepository implements IAuthRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async saveAuthToken(
    secret: string,
    id?: string,
  ): Promise<SessionModel | undefined> {
    const deleted_at = new Date();
    deleted_at.setDate(deleted_at.getDate() + 7);

    const tk = this.getRepository(SessionModel).create({
      id,
      secret,
      deleted_at,
    });
    const dt = await this.getRepository(SessionModel).save(tk);
    return dt;
  }

  async getSession(id: string): Promise<SessionModel> {
    const data = await this.getRepository(SessionModel)
      .createQueryBuilder('s')
      .withDeleted()
      .where('s.deleted_at >= :actual_date', { actual_date: new Date() })
      .andWhere('s.id = :id', { id })
      .getOne();
    if (!data) {
      throw EntityNotFoundError;
    }
    return data;
  }

  async deleteAuthToken(id: string): Promise<boolean> {
    const op = await this.getRepository(SessionModel).delete({ id });
    return op.affected > 0;
  }
}
