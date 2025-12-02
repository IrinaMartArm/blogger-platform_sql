import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { QuestionsInputDto } from '../../api/input-dto/question.input-dto';

export class UpdateQuestionCommand {
  constructor(
    public readonly id: number,
    public readonly body: QuestionsInputDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionHandler
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(private readonly repo: QuestionsRepository) {}

  async execute({ id, body }: UpdateQuestionCommand): Promise<void> {
    const question = await this.repo.getById(id);
    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Not Found',
      });
    }
    question.update(body);
    await this.repo.save(question);
  }
}
