import { MessageModel } from 'models/Message';
import { EmailBody, ListFilter } from './dto';
import { EmailModel } from 'models/Email';
import { UserModel } from 'models/User';

export interface IEmailService {
  ListEmails(
    token: string,
    filters: ListFilter,
    take?: number,
    skip?: number,
  ): Promise<{ emails: MessageModel[]; pages: number }>;
  CreateEmail(token: string, body: EmailBody): Promise<boolean>;
  ToggleFavoriteEmail(token: string, id: string): Promise<boolean>;
  SetReadStatus(token: string, id: string, status: boolean): Promise<boolean>;
  ToggleArchivedStatus(token: string, id: string): Promise<boolean>;
  GetEmailDetail(token: string, id: string): Promise<MessageModel>;
  UpdateEmailMarkers(
    token: string,
    id: string,
    markers: string[],
  ): Promise<boolean>;
}

export interface IEmailRepository {
  getMessagesFromUser(
    user: UserModel,
    composedFilter?: object,
  ): Promise<[MessageModel[], number]>;
  createEmail(email: Partial<EmailModel>): Promise<EmailModel>;
  createMessage(message: Partial<MessageModel>): Promise<boolean>;
  getMessageById(id: string): Promise<MessageModel>;
}
