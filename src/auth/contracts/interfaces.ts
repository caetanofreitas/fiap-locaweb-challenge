import { SessionModel } from 'models/Session';
import { UserModel } from 'models/User';
import { RegisterDTO } from './dto';

export interface IAuthService {
  login(email: string, password: string): Promise<string>;
  register(body: RegisterDTO): Promise<string>;
  editProfile(body: Partial<UserModel>, token: string): Promise<string>;
  deleteAccount(token: string): Promise<boolean>;
  logout(key: string): Promise<boolean>;
  getUserFromToken(token: string): Promise<UserModel>;
  validateUser(token: string): Promise<UserModel>;
}

export interface IAuthRepository {
  saveAuthToken(secret: string, id?: string): Promise<SessionModel | undefined>;
  getSession(bearer: string): Promise<SessionModel | undefined>;
  deleteAuthToken(id: string): Promise<boolean>;
}

export interface IUserRepository {
  getUserByEmail(email: string): Promise<UserModel | undefined>;
  getUserByEmail(id: string): Promise<UserModel | undefined>;
  saveUserData(body: Partial<UserModel>): Promise<UserModel>;
  deleteUserData(id: string): Promise<boolean>;
}
