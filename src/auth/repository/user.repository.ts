import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IUserRepository } from 'auth/contracts';
import { UserModel } from 'models/User';
import { BaseRepository } from 'shared/database';

@Injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  getUserByEmail(email: string): Promise<UserModel> {
    return this.getRepository(UserModel).findOne({ where: { email } });
  }

  getUserById(id: string): Promise<UserModel> {
    return this.getRepository(UserModel).findOne({ where: { id } });
  }

  saveUserData(body: UserModel): Promise<UserModel> {
    return this.getRepository(UserModel).save(body);
  }

  async deleteUserData(id: string): Promise<boolean> {
    const op = await this.getRepository(UserModel).delete({ id });
    return op.affected > 0;
  }
}
