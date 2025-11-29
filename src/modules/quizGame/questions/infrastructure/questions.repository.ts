import { Injectable } from '@nestjs/common';
import { TransactionalRepository } from '../../../../core/decorators/transactions/transactional';
import { Question } from '../entity/question.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class QuestionsRepository extends TransactionalRepository<Question> {
  constructor(dataSource: DataSource) {
    super(dataSource, Question);
  }

  async findByAnswer(answer: string): Promise<Question[]> {
    return await this.repo
      .createQueryBuilder('q')
      .where(`q.correctAnswers::jsonb ? :answer`, { answer })
      .getMany();
  }
}
