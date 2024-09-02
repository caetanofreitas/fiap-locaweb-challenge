import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IUserRepository } from 'user/contracts';
import { UserModel } from 'models/User';
import { BaseRepository } from 'shared/database';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  async getInfo(id: string): Promise<Partial<UserModel>> {
    return this.getRepository(UserModel)
      .createQueryBuilder('u')
      .leftJoin('u.preferences', 'p')
      .select([
        'u.email',
        'u.name',
        'u.profile_picture',
        'p.id',
        'p.is_not_read_active',
        'p.is_favorites_active',
        'p.is_archived_active',
        'p.color_mode',
        'p.markers',
      ])
      .where('u.id = :id', { id })
      .getOne();
  }

  async getFromEmail(email: string): Promise<Partial<UserModel>> {
    return this.getRepository(UserModel)
      .createQueryBuilder('u')
      .leftJoin('u.preferences', 'p')
      .select([
        'u.id',
        'u.email',
        'u.name',
        'u.profile_picture',
        'p.id',
        'p.is_not_read_active',
        'p.is_favorites_active',
        'p.is_archived_active',
        'p.color_mode',
        'p.markers',
        'p.important_addr',
      ])
      .where('u.email = :email', { email })
      .getOne();
  }

  async upsertPreferences(userWithPreferences: UserModel): Promise<boolean> {
    await this.getRepository(UserModel).save(userWithPreferences);
    return true;
  }
}
