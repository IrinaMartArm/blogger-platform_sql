import * as request from 'supertest';
import { Response } from 'supertest';
import { CreateUserInputDto } from '../../src/modules/user-accounts/user/api/input-dto/users.input-dto';
import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import { LoginInputDto } from '../../src/modules/user-accounts/auth/api/input-dto/login.input-dto';

export const login = 'admin';
export const password = 'qwerty';
export const email = 'email@email.em';

export const generateBasicAuthToken = () => {
  const credentials = `${login}:${password}`;
  const token = Buffer.from(credentials).toString('base64');
  return `Basic ${token}`;
};

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(dto?: CreateUserInputDto): Promise<Response> {
    const defaultUser: CreateUserDto = {
      login,
      password,
      email,
    };

    const userData = { ...defaultUser, ...dto };

    return await request(this.app.getHttpServer())
      .post('/sa/users')
      .auth(login, password)
      .send(userData)
      .expect(201);
  }

  async getUsers(): Promise<Response> {
    return await request(this.app.getHttpServer())
      .get('/sa/users?pageNumber=1&pageSize=10&sort=createdAt')
      .auth(login, password)
      .expect(200);
  }

  async registration(user: CreateUserInputDto): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(user)
      .expect(204);
  }

  async login(credentials: LoginInputDto): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(credentials)
      .expect(200);
  }

  async createAndLoginUser(): Promise<Response> {
    await this.createUser();
    return await this.login({ loginOrEmail: login, password });
  }
}
