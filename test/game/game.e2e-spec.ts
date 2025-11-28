import { INestApplication } from '@nestjs/common';
import { getInitApp } from '../helpers/init.test.app';
import { deleteAllData } from '../helpers/deleteAllData';
import * as request from 'supertest';
import { UsersTestManager } from '../helpers/usersTestManager';

describe('Game Game Game Test', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

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

  it('should get all game games from the database', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const response = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .expect(200);

    console.log(response.body);

    expect(response.body).toBeDefined();
  });

  it('should create game', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const resp = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .expect(200);

    console.log(resp.body);
  });
});
