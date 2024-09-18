import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { IEmailRepository } from 'email/contracts';
import { EmailModel } from 'models/Email';
import { MessageModel } from 'models/Message';
import { UserModel } from 'models/User';
import { BaseRepository } from 'shared/database';

@Injectable()
export class EmailRepository
  extends BaseRepository
  implements IEmailRepository
{
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
  }

  getMessagesFromUser(
    user: UserModel,
    composedFilter = {},
    take = 20,
    skip = 0,
  ): Promise<[MessageModel[], number]> {
    return this.getRepository(MessageModel).findAndCount({
      relations: {
        sender_id: true,
        content: true,
      },
      take,
      skip,
      select: {
        id: true,
        send_date: true,
        markers: true,
        read: true,
        favorite: true,
        archived: true,
        content: {
          id: true,
          subject: true,
          preview: true,
        },
        sender_id: {
          name: true,
          profile_picture: true,
        },
      },
      where: {
        ...composedFilter,
        receiver_id: {
          id: user.id,
        },
      },
    });
  }

  createEmail(email: Partial<EmailModel>): Promise<EmailModel> {
    return this.getRepository(EmailModel).save(email);
  }

  async createMessage(message: Partial<MessageModel>): Promise<boolean> {
    await this.getRepository(MessageModel).save(message);
    return true;
  }

  getMessageById(id: string): Promise<MessageModel> {
    return this.getRepository(MessageModel).findOne({
      relations: {
        receiver_id: true,
        content: true,
      },
      where: { id },
      select: {
        id: true,
        send_date: true,
        markers: true,
        favorite: true,
        archived: true,
        content: {
          content: true,
          subject: true,
        },
      },
    });
  }
}
