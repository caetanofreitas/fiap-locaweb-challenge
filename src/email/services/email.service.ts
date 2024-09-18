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
    console.log(where);
    this.userService.UpsertPreferences(token, {
      is_not_read_active: filter.read,
      is_favorites_active: filter.favorite,
      is_importants_active: filter.importants,
      is_archived_active: filter.archived,
    });
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

    const markers = this.validateSpam(body.subject, body.content);

    const baseMessage = {
      send_date: body.sendDate,
      markers,
      read: false,
      archived: false,
      favorite: false,
      sender_id: user,
      content: email,
    };

    await Promise.all(
      [body.to, ...(body?.cc ?? [])].map((u) => this.sendEmail(u, baseMessage)),
    );

    return true;
  }

  private validateSpam(subject: string, content: string): string[] {
    if (this.isSpam(subject, content)) {
      return ['spam'];
    }
    return [];
  }

  private isSpam(subject: string, content: string): boolean {
    const spamKeywords = [
      'ganhe dinheiro',
      'promoção',
      'clique aqui',
      'grátis',
      'oportunidade',
      'comprar agora',
      'oferta',
      'prêmio',
      'seguro',
      'congratulations',
      'urgent',
      'winner',
      'cash',
      'limited time',
      'act now',
      '100% free',
    ];

    // Regra 1: Verificar se o assunto ou conteúdo contém palavras-chave de SPAM
    const lowerSubject = subject.toLowerCase();
    const lowerContent = content.toLowerCase();

    for (const keyword of spamKeywords) {
      if (lowerSubject.includes(keyword) || lowerContent.includes(keyword)) {
        return true;
      }
    }

    // Regra 2: Verificar excesso de caracteres especiais (exclamações, cifrões, etc.)
    const specialCharRegex = /[\!\$\#\%\&\*\@]{3,}/;
    if (specialCharRegex.test(subject) || specialCharRegex.test(content)) {
      return true;
    }

    // Regra 3: Verificar a presença de links encurtados ou URLs suspeitas
    const urlRegex = /(http:\/\/|https:\/\/|www\.)/;
    const shortLinkRegex = /(bit\.ly|goo\.gl|tinyurl\.com)/;

    if (urlRegex.test(content) && shortLinkRegex.test(content)) {
      return true;
    }

    // Regra 4: Verificar se o texto parece não estruturado (ex.: todo em letras maiúsculas)
    if (
      subject === subject.toUpperCase() ||
      content === content.toUpperCase()
    ) {
      return true;
    }

    // Regra 5: Verificar por repetição de palavras no conteúdo
    const words = content.split(/\s+/);
    const wordCounts: { [key: string]: number } = {};
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
      if (wordCounts[lowerWord] > 5) {
        return true;
      }
    }

    return false;
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
