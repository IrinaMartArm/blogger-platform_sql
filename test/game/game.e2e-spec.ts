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
    const response = await gameTestManager.getGame(token1.accessToken);
    const response_ = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 1 1', response.body.id, response_.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    const response2 = await gameTestManager.getGame(token1.accessToken);
    const response_2 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 1 2', response2.body.id, response_2.body.id);

    await gameTestManager.takeAnswer(token2.accessToken, '28');
    const response3 = await gameTestManager.getGame(token2.accessToken);
    const response_3 = await gameTestManager.getGameById(
      token2.accessToken,
      response.body.id,
    );

    console.log('game 2u 1', response3.body.id, response_3.body.id);

    await gameTestManager.takeAnswer(token2.accessToken, '2');
    const response4 = await gameTestManager.getGame(token2.accessToken);
    const response_4 = await gameTestManager.getGameById(
      token2.accessToken,
      response.body.id,
    );

    console.log('game 2u 2', response4.body.id, response_4.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    const response5 = await gameTestManager.getGame(token1.accessToken);
    const response_5 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 1u 3', response5.body.id, response_5.body.id);

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    const response6 = await gameTestManager.getGame(token1.accessToken);
    const response_6 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 1u 4', response6.body.id, response_6.body.id);

    const res99 = await gameTestManager.takeAnswer(token2.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '2');

    const response7 = await gameTestManager.getGame(token1.accessToken);
    const response_7 = await gameTestManager.getGame(token2.accessToken);

    console.log(
      'game 2u 4',
      JSON.stringify(response_7.body.firstPlayerProgress, null, 2),
      JSON.stringify(response_7.body.secondPlayerProgress, null, 2),
    );
    console.log('answer', JSON.stringify(res99.body, null, 2));

    await gameTestManager.takeAnswer(token1.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    // await gameTestManager.takeAnswer(token2.accessToken, '2');

    // const response8 = await gameTestManager.getGame(token1.accessToken);
    const response_8 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 1u 5', response_8.body.id);

    // const response9 = await gameTestManager.getGame(token2.accessToken);
    const response_9 = await gameTestManager.getGameById(
      token2.accessToken,
      response.body.id,
    );

    console.log('game 2u 5', response_9.body.firstPlayerProgress.answers);

    // const responseLast = await gameTestManager.getGame(token1.accessToken);
    const responseLast2 = await gameTestManager.getGameById(
      token1.accessToken,
      response.body.id,
    );

    console.log('game 2u 5', responseLast2.body.firstPlayerProgress.answers);

    // const responseLast_ = await gameTestManager.getGame(token2.accessToken);
    // const responseLast2_ = await gameTestManager.getGameById(
    //   token2.accessToken,
    //   response.body.id,
    // );

    // console.log('dame', responseLast);
    // console.log('dame', responseLast2.body);
    // console.log('dame', responseLast_);
    // console.log('dame', responseLast2_.body);

    // expect(responseLast.body.firstPlayerProgress.answers.length).toBe(5);
    expect(responseLast2.body.firstPlayerProgress.answers.length).toBe(5);
    // expect(responseLast.body.secondPlayerProgress.answers.length).toBe(3);
    // expect(responseLast2.body.secondPlayerProgress.answers.length).toBe(5);
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
    // const res2 = await usersTestManager.createAndLoginUser({
    //   login: 'username_2',
    //   password: 'qwerty',
    //   email: 'email_2@test.com',
    // });
    // const res3 = await usersTestManager.createAndLoginUser({
    //   login: 'username3',
    //   password: 'qwerty',
    //   email: 'email_3@test.com',
    // });

    const token = res.body as { accessToken: string };
    const token1 = res1.body as { accessToken: string };
    // const token2 = res2.body as { accessToken: string };
    // const token3 = res3.body as { accessToken: string };

    await gameTestManager.startGame(token.accessToken);
    await gameTestManager.startGame(token1.accessToken);
    // await gameTestManager.startGame(token2.accessToken);
    // await gameTestManager.startGame(token3.accessToken);

    const response = await gameTestManager.getGame(token.accessToken);
    const response1 = await gameTestManager.getGame(token1.accessToken);
    // const response2 = await gameTestManager.getGame(token2.accessToken);
    // const response3 = await gameTestManager.getGame(token3.accessToken);

    const answer = await gameTestManager.takeAnswer(token.accessToken, '2');
    const answer2 = await gameTestManager.takeAnswer(token1.accessToken, '5');

    const response7 = await gameTestManager.getGame(token.accessToken);
    const response_7 = await gameTestManager.getGame(token1.accessToken);

    console.log(
      'game firstPlayer',
      JSON.stringify(response7.body, null, 2),
      // JSON.stringify(response7.body.secondPlayerProgress, null, 2),
    );
    console.log(
      'game secondPlayer',
      JSON.stringify(response_7.body, null, 2),
      // JSON.stringify(response_7.body.secondPlayerProgress, null, 2),
    );
    console.log('answer', JSON.stringify(answer.body, null, 2));
    console.log('answer 2', JSON.stringify(answer2.body, null, 2));

    expect(response.body).toBeDefined();
    expect(response1.body).toBeDefined();
  });

  it('gel all my games', async () => {
    const res = await usersTestManager.createAndLoginUser();
    await usersTestManager.createAndLoginUser(user);

    const token = res.body as { accessToken: string };

    await gameTestManager.startGame(token.accessToken);

    const resp = await request(app.getHttpServer())
      .get('/pair-game-quiz/pairs/my')
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(200);

    expect(resp.body.items).toBeInstanceOf(Array);
    expect(resp.body.items.length).toBe(1);
  });

  it('gel games statistic', async () => {
    const res = await usersTestManager.createAndLoginUser();
    const res2 = await usersTestManager.createAndLoginUser(user);

    const res3 = await usersTestManager.createAndLoginUser({
      login: 'username_2',
      password: 'qwerty',
      email: 'email_2@test.com',
    });
    const res4 = await usersTestManager.createAndLoginUser({
      login: 'username3',
      password: 'qwerty',
      email: 'email_3@test.com',
    });

    const token = res.body as { accessToken: string };
    const token2 = res2.body as { accessToken: string };
    const token3 = res3.body as { accessToken: string };
    const token4 = res4.body as { accessToken: string };

    await gameTestManager.startGame(token.accessToken);
    await gameTestManager.startGame(token2.accessToken);
    await gameTestManager.startGame(token3.accessToken);
    await gameTestManager.startGame(token4.accessToken);

    await gameTestManager.takeAnswer(token.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token3.accessToken, '2');
    await gameTestManager.takeAnswer(token4.accessToken, '5');

    await gameTestManager.takeAnswer(token.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token3.accessToken, '2');
    await gameTestManager.takeAnswer(token4.accessToken, '5');

    await gameTestManager.takeAnswer(token.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token3.accessToken, '2');
    await gameTestManager.takeAnswer(token4.accessToken, '5');

    await gameTestManager.takeAnswer(token.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token3.accessToken, '2');
    await gameTestManager.takeAnswer(token4.accessToken, '5');

    await gameTestManager.takeAnswer(token.accessToken, '2');
    await gameTestManager.takeAnswer(token2.accessToken, '5');
    await gameTestManager.takeAnswer(token4.accessToken, '5');
    await gameTestManager.takeAnswer(token3.accessToken, '2');

    const resp = await request(app.getHttpServer())
      .get('/pair-game-quiz/users/my-statistic')
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(200);

    const resp2 = await request(app.getHttpServer())
      .get(
        '/pair-game-quiz/users/top?pageSize=3&sort=avgScores desc&sort=sumScore desc',
      )
      .set('Authorization', `Bearer ${token.accessToken}`)
      .expect(200);

    expect(resp.body.gamesCount).toBe(1);
    expect(resp.body.winsCount).toBe(1);
    expect(resp2.body.items.length).toBe(3);
  });
});
