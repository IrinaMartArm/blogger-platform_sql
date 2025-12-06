import { Injectable } from '@nestjs/common';
import { TransactionalRepository } from '../../../../core/decorators/transactions/transactional';
import { Question } from '../entity/question.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class QuestionsRepository extends TransactionalRepository<Question> {
  constructor(
    dataSource: DataSource,
    // @InjectRepository(Question) private readonly repo: Repository<Question>,
  ) {
    super(dataSource, Question);
  }

  async getById(id: number): Promise<Question | null> {
    return this.dataSource
      .createQueryBuilder(Question, 'q')
      .where('q.id = :id', { id })
      .getOne();
  }

  async getQuestions(limit: number = 5): Promise<Question[]> {
    return await this.dataSource
      .createQueryBuilder(Question, 'q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(Question, 'q')
      .where('q.id = :id', { id })
      .execute();
  }

  async findByAnswer(answer: string): Promise<Question[]> {
    return await this.repo
      .createQueryBuilder('q')
      .where(`q.correctAnswers::jsonb ? :answer`, { answer })
      .getMany();
  }
}
