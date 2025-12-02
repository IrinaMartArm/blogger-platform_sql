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

describe('Game Game Game Test', () => {
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
    await request(app.getHttpServer())
      .put(`/sa/quiz/questions/${question.body.id}/publish`)
      .set('Authorization', generateBasicAuthToken())
      .send(body)
      .expect(204);

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
});
