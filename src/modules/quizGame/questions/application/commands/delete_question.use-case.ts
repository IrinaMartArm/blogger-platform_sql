import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class DeleteQuestionCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionCommandHandler
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    return this.questionRepo.delete(id);
  }
}
