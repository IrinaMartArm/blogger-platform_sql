import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePublishCommand {
  constructor(
    public readonly id: number,
    public readonly isPublished: boolean,
  ) {}
}

@CommandHandler(UpdatePublishCommand)
export class UpdatePublishCommandHandler
  implements ICommandHandler<UpdatePublishCommand>
{
  constructor(private readonly repo: QuestionsRepository) {}

  async execute({ id, isPublished }: UpdatePublishCommand): Promise<void> {
    const question = await this.repo.getById(id);

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Not Found',
      });
    }

    question.changePublished(isPublished);
    await this.repo.save(question);
  }
}
