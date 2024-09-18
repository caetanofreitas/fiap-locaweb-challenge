import { Injectable } from '@nestjs/common';
import { AuthService } from 'auth/services';
import { UserModel } from 'models/User';
import { UserRepository } from 'user/repository';
import { IUserService } from 'user/contracts';
import { UserPreferencesModel } from 'models/Preferences';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async GetInfo(token: string): Promise<Partial<UserModel>> {
    const user = await this.authService.validateUser(token);
    return this.repo.getInfo(user.id);
  }

  async GetUserFromEmail(email: string): Promise<Partial<UserModel>> {
    return await this.repo.getFromEmail(email);
  }

  async UpsertPreferences(
    token: string,
    preferences: Partial<UserPreferencesModel>,
  ): Promise<boolean> {
    let user = await this.authService.validateUser(token);

    user = {
      ...user,
      ...((await this.repo.getInfo(user.id)) as UserModel),
    };
    if (user.preferences) {
      preferences.id = (user.preferences as UserPreferencesModel).id;
    }

    user.preferences = {
      ...(user.preferences as UserPreferencesModel),
      ...preferences,
    };
    return this.repo.upsertPreferences(user);
  }
}
