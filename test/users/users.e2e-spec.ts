import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { login, password, UsersTestManager } from '../helpers/usersTestManager';
import { deleteAllData } from '../helpers/deleteAllData';
import { getInitApp } from '../helpers/init.test.app';
import { UserViewDto } from '../../src/modules/user-accounts/user/api/view-dto/user.view-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { EmailService } from '../../src/modules/user-accounts/auth/application/email.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  const user = {
    login: 'admin2',
    password: 'qwerty',
    email: '2test@test.com',
  };

  beforeAll(async () => {
    const result = await getInitApp();
    app = result.app;
    usersTestManager = result.userTestManger;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create user', async () => {
    const response = await usersTestManager.createUser(user);

    expect(response.body).toMatchObject({
      login: user.login,
      email: user.email,
    });
  });

  it('should get users', async () => {
    await usersTestManager.createUser();
    const response = await usersTestManager.getUsers();

    const body = response.body as PaginatedViewDto<UserViewDto[]>;

    expect(body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBe(2);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('should get user by id', async () => {
    const newUser = await usersTestManager.createUser(user);
    await usersTestManager.createUser();
    const response = await request(app.getHttpServer())
      .get(`/sa/users/${newUser.body.id}`)
      .auth(login, password)
      .expect(200);

    expect(response.body).toEqual(newUser.body);
  });

  it('should delete user by id', async () => {
    const newUser = await usersTestManager.createUser(user);
    await usersTestManager.createUser();
    await request(app.getHttpServer())
      .delete(`/sa/users/${newUser.body.id}`)
      .auth(login, password)
      .expect(204);

    const response = await usersTestManager.getUsers();

    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items.length).toBe(1);
  });

  it('registration user', async () => {
    const emailService = app.get(EmailService);

    const sendEmailMock = jest
      .spyOn(emailService, 'sendConfirmationEmail')
      .mockImplementation(() => Promise.resolve());

    await usersTestManager.registration(user);

    expect(sendEmailMock).toHaveBeenCalledTimes(1);

    const callArgs = sendEmailMock.mock.calls[0][0];
    expect(callArgs).toBe(user.email);

    sendEmailMock.mockRestore();
  });

  it('should login user', async () => {
    await usersTestManager.createUser(user);
    await usersTestManager.login({
      loginOrEmail: user.login,
      password: user.password,
    });
  });
});
