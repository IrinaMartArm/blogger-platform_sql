import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteQuestionCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionCommandHandler
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    const question = await this.questionRepo.getById(id);

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
      });
    }
    return this.questionRepo.delete(id);
  }
}
