import { QuestionsInputDto } from '../../src/modules/quizGame/questions/api/input-dto/question.input-dto';
import * as request from 'supertest';
import { generateBasicAuthToken } from './usersTestManager';
import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';

export class GameTestManager {
  constructor(private app: INestApplication) {}
  createQuestion(question?: QuestionsInputDto): Promise<Response> {
    const defaultQuestion: QuestionsInputDto = {
      body: 'vopros nomer 1',
      correctAnswers: ['otvet 1', 'otvet 2'],
    };
    const body = { ...defaultQuestion, ...question };

    return request(this.app.getHttpServer())
      .post('/sa/quiz/questions')
      .set('Authorization', generateBasicAuthToken())
      .send(body)
      .expect(201);
  }

  async changePublished(id: number, body: { published: boolean }) {
    await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${id}/publish`)
      .set('Authorization', generateBasicAuthToken())
      .send(body)
      .expect(204);
  }

  async createQuestions() {
    const body = { published: true };
    const q1 = await this.createQuestion();
    await this.changePublished(q1.body.id, body);
    const q2 = await this.createQuestion({
      body: 'question 2',
      correctAnswers: ['2'],
    });
    await this.changePublished(q2.body.id, body);
    const q3 = await this.createQuestion({
      body: 'question 3',
      correctAnswers: ['2'],
    });
    await this.changePublished(q3.body.id, body);
    const q4 = await this.createQuestion({
      body: 'question 4',
      correctAnswers: ['2'],
    });
    await this.changePublished(q4.body.id, body);
    const q5 = await this.createQuestion({
      body: 'question 5',
      correctAnswers: ['2'],
    });
    await this.changePublished(q5.body.id, body);

    const q6 = await this.createQuestion({
      body: 'question 6',
      correctAnswers: ['6'],
    });
    // await this.changePublished(q6.body.id, body);
    const q7 = await this.createQuestion({
      body: 'question 7',
      correctAnswers: ['7'],
    });
    // await this.changePublished(q7.body.id, body);
  }

  getQuestions() {
    return request(this.app.getHttpServer())
      .get('/sa/quiz/questions')
      .set('Authorization', generateBasicAuthToken())
      .expect(200);
  }

  async startGame(accessToken: string): Promise<Response> {
    await this.createQuestions();
    return request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }

  async getGame(accessToken: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .get('/pair-game-quiz/pairs/my-current')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }

  takeAnswer(accessToken: string, answer: string): Promise<Response> {
    return request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ answer })
      .expect(200);
  }

  getGameById(accessToken: string, id: number): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(`/pair-game-quiz/pairs/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  }
}
