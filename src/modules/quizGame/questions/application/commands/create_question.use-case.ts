import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsInputDto } from '../../api/input-dto/question.input-dto';
import { Question } from '../../entity/question.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class CreateQuestionCommand {
  constructor(public readonly body: QuestionsInputDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionCommandHandler
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(private readonly questionRepo: QuestionsRepository) {}

  async execute({ body }: CreateQuestionCommand): Promise<number> {
    const question = Question.create(body);
    await this.questionRepo.save(question);

    return question.id;
  }
}
