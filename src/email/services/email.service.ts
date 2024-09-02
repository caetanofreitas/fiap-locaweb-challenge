import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from 'auth/services';
import { EmailBody, IEmailService, ListFilter } from 'email/contracts';
import { EmailRepository } from 'email/repository';
import { MessageModel } from 'models/Message';
import { UserPreferencesModel } from 'models/Preferences';
import { UserModel } from 'models/User';
import { UserService } from 'user/services';

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    private readonly authService: AuthService,
    private readonly repo: EmailRepository,
    private readonly userService: UserService,
  ) {}

  async GetEmailDetail(token: string, id: string): Promise<MessageModel> {
    const user = await this.authService.validateUser(token);
    const email = await this.repo.getMessageById(id);
    if (!email) throw new NotFoundException();
    if (email.receiver_id.id != user.id) throw new ForbiddenException();
    delete email.receiver_id;
    return email;
  }

  async ListEmails(
    token: string,
    filter: ListFilter,
  ): Promise<{ emails: MessageModel[]; pages: number }> {
    const user = await this.authService.validateUser(token);
    const where = filter.getFilters();
    const [emails, total] = await this.repo.getMessagesFromUser(
      user,
      where,
      filter.limit,
      filter.page,
    );
    return { emails, pages: Math.ceil(total / filter.limit) };
  }

  async CreateEmail(token: string, body: EmailBody): Promise<boolean> {
    let user = await this.authService.validateUser(token);
    user = (await this.userService.GetUserFromEmail(user.email)) as UserModel;

    const email = await this.repo.createEmail({
      content: body.content,
      subject: body.subject,
      preview: this.getPreview(body.content),
    });

    const baseMessage = {
      send_date: body.sendDate,
      markers: [],
      read: false,
      archived: false,
      favorite: false,
      sender_id: user,
      content: email,
    };

    await Promise.all(
      [body.for, ...(body?.cc ?? [])].map((u) =>
        this.sendEmail(u, baseMessage),
      ),
    );

    return true;
  }

  private getPreview(input: string): string {
    const plainText = input.replace(/<[^>]*>/g, '');
    if (plainText.length > 100) {
      return plainText.substring(0, 100) + '...';
    }
    return plainText;
  }

  private async sendEmail(
    user: string,
    message: Partial<MessageModel>,
  ): Promise<boolean> {
    const receiver = await this.userService.GetUserFromEmail(user);
    if (!receiver) throw new NotFoundException();

    if (
      (
        message?.sender_id.preferences as unknown as UserPreferencesModel
      )?.important_addr?.includes(user)
    ) {
      message.importants = true;
    }

    message.receiver_id = receiver as UserModel;
    await this.repo.createMessage(message);
    return true;
  }

  async ToggleFavoriteEmail(token: string, id: string): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const message = await this.repo.getMessageById(id);
    if (!message) throw new NotFoundException();
    if (message.receiver_id.id != user.id) throw new ForbiddenException();
    message.favorite = !message.favorite;
    await this.repo.createMessage(message);
    return true;
  }

  async ToggleArchivedStatus(token: string, id: string): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const message = await this.repo.getMessageById(id);
    if (!message) throw new NotFoundException();
    if (message.receiver_id.id != user.id) throw new ForbiddenException();
    message.archived = !message.archived;
    await this.repo.createMessage(message);
    return true;
  }

  async SetReadStatus(
    token: string,
    id: string,
    status: boolean,
  ): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const message = await this.repo.getMessageById(id);
    if (!message) throw new NotFoundException();
    if (message.receiver_id.id != user.id) throw new ForbiddenException();
    message.read = status;
    await this.repo.createMessage(message);
    return true;
  }

  async UpdateEmailMarkers(
    token: string,
    id: string,
    markers: string[],
  ): Promise<boolean> {
    const user = await this.authService.validateUser(token);
    const message = await this.repo.getMessageById(id);
    if (!message) throw new NotFoundException();
    if (message.receiver_id.id != user.id) throw new ForbiddenException();
    message.markers = markers.map((m) => m.toLowerCase());
    await this.repo.createMessage(message);
    return true;
  }
}
