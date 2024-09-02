import { UserPreferencesModel } from 'models/Preferences';
import { UserModel } from 'models/User';

export interface IUserService {
  GetInfo(token: string): Promise<Partial<UserModel>>;
  GetUserFromEmail(email: string): Promise<Partial<UserModel>>;
  UpsertPreferences(
    token: string,
    preferences: UserPreferencesModel,
  ): Promise<boolean>;
}

export interface IUserRepository {
  getInfo(id: string): Promise<Partial<UserModel>>;
  upsertPreferences(userWithPreferences: UserModel): Promise<boolean>;
}
