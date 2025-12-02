import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionQueryRepository } from '../../infrastructure/question.query-repository';
import { QuestionsViewDto } from '../../api/view-dto/question.wiew-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetQuestionQuery {
  constructor(public readonly questionId: number) {}
}

@QueryHandler(GetQuestionQuery)
export class GetQuestionQueryHandler
  implements IQueryHandler<GetQuestionQuery>
{
  constructor(private readonly repo: QuestionQueryRepository) {}

  async execute({ questionId }: GetQuestionQuery): Promise<QuestionsViewDto> {
    const result = await this.repo.getQuestionById(questionId);

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
      });
    }

    return QuestionsViewDto.mapToView(result);
  }
}
