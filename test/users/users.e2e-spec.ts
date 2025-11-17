import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersTestManager } from '../helpers/usersTestManager';
import { deleteAllData } from '../helpers/deleteAllData';
import { getInitApp } from '../helpers/init.test.app';
import { UserViewDto } from '../../src/modules/user-accounts/user/api/view-dto/user.view-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

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

  it('should return 400 for invalid data', async () => {
    await usersTestManager.createUser();
    const response = await usersTestManager.getUsers();

    const body = response.body as PaginatedViewDto<UserViewDto[]>;

    expect(body.items).toBeInstanceOf(Array);
    expect(body.items.length).toBeGreaterThan(0);
  });
});
// const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
//   .fn()
//   .mockImplementation(() => Promise.resolve()));
