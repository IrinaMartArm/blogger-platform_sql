import { GetQuestionsQueryParamsInputDto } from '../../api/input-dto/get_questions_query_params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { QuestionsViewDto } from '../../api/view-dto/question.wiew-dto';
import { QuestionQueryRepository } from '../../infrastructure/question.query-repository';

export class GetQuestionsQuery {
  constructor(public readonly query: GetQuestionsQueryParamsInputDto) {}
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler
  implements IQueryHandler<GetQuestionsQuery>
{
  constructor(private readonly repo: QuestionQueryRepository) {}

  async execute({
    query,
  }: GetQuestionsQuery): Promise<PaginatedViewDto<QuestionsViewDto[]>> {
    const { pageSize, pageNumber } = query;

    const { result, totalCount } = await this.repo.getQuestions(query);

    const items = result.map((q) => QuestionsViewDto.mapToView(q));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      size: pageSize,
      page: pageNumber,
    });
  }
}
