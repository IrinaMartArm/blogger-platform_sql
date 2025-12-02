import { QuestionsInputDto } from '../../src/modules/quizGame/questions/api/input-dto/question.input-dto';
import * as request from 'supertest';
import { generateBasicAuthToken } from './usersTestManager';
import { INestApplication } from '@nestjs/common';
import { Response } from 'supertest';

export class GameTestManager {
  constructor(private app: INestApplication) {}
  async createQuestion(question?: QuestionsInputDto): Promise<Response> {
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

  getQuestions() {
    return request(this.app.getHttpServer())
      .get('/sa/quiz/questions')
      .set('Authorization', generateBasicAuthToken())
      .expect(200);
  }
}
