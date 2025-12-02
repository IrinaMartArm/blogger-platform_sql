import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Question } from '../entity/question.entity';
import {
  GetQuestionsQueryParamsInputDto,
  PublishedSearch,
  QuestionsSortBy,
} from '../api/input-dto/get_questions_query_params.input-dto';

@Injectable()
export class QuestionQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getQuestionById(id: number) {
    return this.dataSource
      .createQueryBuilder(Question, 'q')
      .where('q.id = :id', { id })
      .getOne();
  }

  async getQuestions(
    query: GetQuestionsQueryParamsInputDto,
  ): Promise<{ result: Question[]; totalCount: number }> {
    const {
      pageSize,
      sortDirection,
      pageNumber,
      sortBy,
      publishedStatus,
      bodySearchTerm,
    } = query;
    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = (pageNumber - 1) * pageSize;

    const qb = this.dataSource.createQueryBuilder(Question, 'q');

    if (bodySearchTerm) {
      qb.where('q.body ILIKE :term', { term: `%${bodySearchTerm}%` });
    }

    if (publishedStatus !== PublishedSearch.All) {
      qb.andWhere('q.published = :status', {
        status: qb.andWhere('q.published = :status', {
          status: publishedStatus === PublishedSearch.Published,
        }),
      });
    }

    qb.orderBy(`q.${this.getSortField(sortBy)}`, dir).addOrderBy('q.id', dir);

    const [result, totalCount] = await qb
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return { result, totalCount };
  }

  private getSortField(sortBy?: string): string {
    const sortFieldMap: Record<QuestionsSortBy, string> = {
      [QuestionsSortBy.CreatedAt]: 'createdAt',
      [QuestionsSortBy.Body]: 'body',
    };
    return sortFieldMap[sortBy as QuestionsSortBy] ?? 'createdAt';
  }
}
