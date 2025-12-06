import { INestApplication } from '@nestjs/common';
import { getInitApp } from '../helpers/init.test.app';
import { deleteAllData } from '../helpers/deleteAllData';
import * as request from 'supertest';
import {
  generateBasicAuthToken,
  UsersTestManager,
} from '../helpers/usersTestManager';
import { GameTestManager } from '../helpers/gameTestManager';
import { QuestionsInputDto } from '../../src/modules/quizGame/questions/api/input-dto/question.input-dto';
import { QuestionsViewDto } from '../../src/modules/quizGame/questions/api/view-dto/question.wiew-dto';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import { GameViewDto } from '../../src/modules/quizGame/game/api/view-dto/game.view-dto';

const user: CreateUserDto = {
  login: 'username',
  password: 'qwerty',
  email: 'email@test.com',
};

describe('Game', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let gameTestManager: GameTestManager;

  beforeAll(async () => {
    const result = await getInitApp();
    app = result.app;
    usersTestManager = result.userTestManger;
    gameTestManager = result.gameTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should returns current pair in which current user is taking part', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const res2 = await usersTestManager.createAndLoginUser(user);
    await gameTestManager.startGame(res.body.accessToken);
    await gameTestManager.startGame(res2.body.accessToken);
    const response = await gameTestManager.getGame(res.body.accessToken);

    expect(response.body).toBeDefined();
  });

  it('get my-current should return 404 if one player', async () => {
    const res = await usersTestManager.createAndLoginUser();
    // const res2 = await usersTestManager.createAndLoginUser(user);
    await gameTestManager.startGame(res.body.accessToken);
    // await gameTestManager.startGame(res2.body.accessToken);
    const response = await gameTestManager.getGame(res.body.accessToken);

    expect(response.body).toBeDefined();
  });

  it('should create game', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const resp = await gameTestManager.startGame(res.body.accessToken);
  });

  it('should create question', async () => {
    const question: QuestionsInputDto = {
      body: 'vopros vopros',
      correctAnswers: ['otvet 1', 'otvet 2'],
    };
    const response = await gameTestManager.createQuestion(question);

    expect(response.body).toEqual({
      id: expect.any(String) as string,
      body: question.body,
      correctAnswers: question.correctAnswers,
      createdAt: expect.any(String) as string,
      published: false,
      updatedAt: expect.any(String) as string,
    });
  });

  it('should get all questions', async () => {
    await gameTestManager.createQuestion();
    await gameTestManager.createQuestion();

    const resp = await gameTestManager.getQuestions();

    expect(resp.body.items).toBeInstanceOf(Array);
    expect(resp.body.items.length).toBe(2);
  });

  it('should delete question', async () => {
    const question = await gameTestManager.createQuestion();

    await request(app.getHttpServer())
      .delete(`/sa/quiz/questions/${question.body.id}`)
      .set('Authorization', generateBasicAuthToken())
      .expect(204);
  });

  it('should update question', async () => {
    const body: QuestionsInputDto = {
      body: 'vopros vopros',
      correctAnswers: ['otvet 1', 'otvet 2'],
    };

    const result = await gameTestManager.createQuestion();
    const question = result.body as QuestionsViewDto;

    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.id}`)
      .set('Authorization', generateBasicAuthToken())
      .send(body)
      .expect(204);

    const resp = await gameTestManager.getQuestions();
    const item = resp.body.items[0] as QuestionsViewDto;

    expect(item).toEqual({
      id: question.id,
      body: body.body,
      correctAnswers: body.correctAnswers,
      createdAt: question.createdAt,
      published: false,
      updatedAt: expect.any(String) as string,
    });
  });

  it('should sort by body desc', async () => {
    await gameTestManager.createQuestion({
      body: 'AAA question',
      correctAnswers: ['1'],
    });
    await gameTestManager.createQuestion({
      body: 'ZZZ question',
      correctAnswers: ['1'],
    });

    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?sortBy=body&sortDirection=DESC')
      .set('Authorization', generateBasicAuthToken())
      .expect(200);

    expect(res.body.items[0].body.startsWith('ZZZ')).toBe(true);
  });

  it('should update published', async () => {
    const body = { published: true };
    const question = await gameTestManager.createQuestion();
    await gameTestManager.changePublished(question.body.id, body);

    const resp = await gameTestManager.getQuestions();
    const item = resp.body.items[0] as QuestionsViewDto;

    expect(item.published).toBe(true);
  });

  it('should filter by bodySearchTerm', async () => {
    await gameTestManager.createQuestion();
    await gameTestManager.createQuestion({
      body: 'AAA question',
      correctAnswers: ['1'],
    });
    await gameTestManager.createQuestion({
      body: 'JavaScript question',
      correctAnswers: ['1'],
    });

    const res = await request(app.getHttpServer())
      .get('/sa/quiz/questions?bodySearchTerm=script')
      .set('Authorization', generateBasicAuthToken())
      .expect(200);

    expect(res.body.items[0].body).toContain('JavaScript');
  });

  it('should send answer', async () => {
    await gameTestManager.createQuestions();
    const res = await usersTestManager.createAndLoginUser();
    const res2 = await usersTestManager.createAndLoginUser(user);

    const token1 = res.body as { accessToken: string };
    const token2 = res2.body as { accessToken: string };

    await gameTestManager.startGame(token1.accessToken);
    await gameTestManager.startGame(token2.accessToken);

    // const response = await gameTestManager.getGame(token1.accessToken);
    // console.log('response firstP', response.body.firstPlayerProgress.answers);
    // console.log('response secondP', response.body.secondPlayerProgress.answers);

    await gameTestManager.takeAnswer(token1.accessToken, 'otvet 12');
    console.log('date', new Date().toISOString());
    const response = await gameTestManager.getGame(token1.accessToken);
    console.log('game', response.body.firstPlayerProgress.answers);
    await gameTestManager.getGameById(token1.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    await gameTestManager.getGame(token1.accessToken);
    await gameTestManager.getGameById(token1.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token2.accessToken, '28');
    await gameTestManager.getGame(token2.accessToken);
    await gameTestManager.getGameById(token2.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token2.accessToken, '2');
    await gameTestManager.getGame(token2.accessToken);
    await gameTestManager.getGameById(token2.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    await gameTestManager.getGame(token1.accessToken);
    await gameTestManager.getGameById(token1.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    await gameTestManager.getGame(token1.accessToken);
    await gameTestManager.getGameById(token1.accessToken, response.body.id);

    await gameTestManager.takeAnswer(token2.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '2');

    await gameTestManager.getGame(token2.accessToken);
    await gameTestManager.getGameById(token2.accessToken, response.body.id);

    // await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token1.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '2');

    // const responseLast = await gameTestManager.getGame(token1.accessToken);
    const responseLast2 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    // const responseLast_ = await gameTestManager.getGame(token2.accessToken);
    const responseLast2_ = await gameTestManager.getGameById(
      token2.accessToken,
      response.body.id,
    );

    // console.log('dame', responseLast);
    console.log('dame', responseLast2.body);
    // console.log('dame', responseLast_);
    console.log('dame', responseLast2_.body);

    // expect(responseLast.body.firstPlayerProgress.answers.length).toBe(5);
    expect(responseLast2.body.firstPlayerProgress.answers.length).toBe(5);
    // expect(responseLast.body.secondPlayerProgress.answers.length).toBe(3);
    expect(responseLast2.body.secondPlayerProgress.answers.length).toBe(5);
    // expect(response3.body.finishGameDate).toBeDefined();
  });

  it('', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const res2 = await usersTestManager.createAndLoginUser(user);

    const token1 = res.body as { accessToken: string };
    const token2 = res2.body as { accessToken: string };

    await gameTestManager.startGame(token1.accessToken);
    await gameTestManager.startGame(token2.accessToken);

    await gameTestManager.takeAnswer(token1.accessToken, '2');

    const response = await gameTestManager.getGame(token1.accessToken);
    const response3 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );
    // console.log('game', response.body);

    expect(response3.body).toBeDefined();
  });

  it('', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const res1 = await usersTestManager.createAndLoginUser(user);
    const res2 = await usersTestManager.createAndLoginUser({
      login: 'username_2',
      password: 'qwerty',
      email: 'email_2@test.com',
    });
    const res3 = await usersTestManager.createAndLoginUser({
      login: 'username3',
      password: 'qwerty',
      email: 'email_3@test.com',
    });

    const token = res.body as { accessToken: string };
    const token1 = res1.body as { accessToken: string };
    const token2 = res2.body as { accessToken: string };
    const token3 = res3.body as { accessToken: string };

    await gameTestManager.startGame(token.accessToken);
    await gameTestManager.startGame(token1.accessToken);
    await gameTestManager.startGame(token2.accessToken);
    await gameTestManager.startGame(token3.accessToken);

    await gameTestManager.takeAnswer(token1.accessToken, '2');

    const response = await gameTestManager.getGame(token.accessToken);
    const response1 = await gameTestManager.getGame(token1.accessToken);
    const response2 = await gameTestManager.getGame(token2.accessToken);
    const response3 = await gameTestManager.getGame(token3.accessToken);
    const resз = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    expect(response.body).toBeDefined();
    expect(response1.body).toBeDefined();
    expect(response2.body).toBeDefined();
    expect(response3.body).toBeDefined();
  });
});
