import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { IAuthService, RegisterDTO } from 'auth/contracts';
import { AuthRepository, UserRepository } from 'auth/repository';
import { UserModel } from 'models/User';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepo.getUserByEmail(email);
    if (!user) throw new NotFoundException();

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) throw new UnauthorizedException();

    const secret = await this.getToken(user);
    const session = await this.authRepo.saveAuthToken(secret);

    return session.id;
  }

  async logout(token: string): Promise<boolean> {
    const session = await this.authRepo.getSession(token);
    if (!session) throw new UnauthorizedException();
    await this.authRepo.deleteAuthToken(session.id);
    return true;
  }

  async register(body: RegisterDTO): Promise<string> {
    let user = await this.userRepo.getUserByEmail(body.email);
    if (user) throw new BadRequestException();

    const password = await this.hashData(body.password);

    user = await this.userRepo.saveUserData({
      email: body.email,
      name: body.name,
      profile_picture: body.profile_picture,
      password,
    });
    delete user.password;
    const secret = await this.getToken(user);
    const session = await this.authRepo.saveAuthToken(secret);

    return session.id;
  }

  async editProfile(body: UserModel, token: string): Promise<string> {
    const sess = await this.authRepo.getSession(token);
    if (!sess) throw new UnauthorizedException();

    let user = await this.userRepo.getUserByEmail(body.email);
    if (!user) throw new NotFoundException();

    const s = await this.authRepo.getSession(token);

    user = await this.userRepo.saveUserData(body);
    delete user.password;
    const secret = await this.getToken(user);
    const session = await this.authRepo.saveAuthToken(secret, s.id);

    return session.id;
  }

  async deleteAccount(token: string): Promise<boolean> {
    const sess = await this.authRepo.getSession(token);
    if (!sess) throw new UnauthorizedException();
    const data = this.extractToken(sess.secret);

    await this.userRepo.deleteUserData(data.id);
    await this.authRepo.deleteAuthToken(data.id);

    return true;
  }

  async getUserFromToken(token: string): Promise<UserModel> {
    const session = await this.authRepo.getSession(token);
    if (!session) throw new NotFoundException();
    return this.extractToken(session.secret);
  }

  async validateUser(token: string): Promise<UserModel> {
    const user = await this.getUserFromToken(token);
    if (!user) throw new ForbiddenException();
    return user;
  }

  private async getToken(body: UserModel) {
    return this.jwtService.signAsync(JSON.stringify(body), {
      secret: this.configService.get('PRIVATE_SECRET') || 'PRIVATE_SECRET',
    });
  }

  private extractToken(tk: string): UserModel {
    return this.jwtService.decode<UserModel>(tk);
  }

  private async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }
}
