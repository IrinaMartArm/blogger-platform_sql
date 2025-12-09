import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameRepository } from '../../infrastructure/game.repository';

export class SendAnswerCommand {
  constructor(
    public readonly userId: number,
    public readonly answer: string,
  ) {}
}

@CommandHandler(SendAnswerCommand)
export class SendAnswerCommandHandler
  implements ICommandHandler<SendAnswerCommand>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly gameRepository: GameRepository,
  ) {}

  async execute({ userId, answer }: SendAnswerCommand) {
    return this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      const gameRepo = this.gameRepository.withTransaction(manager);

      const game = await gameRepo.findActiveGameByUserId(userId);

      if (!game) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: `Game not active`,
        });
      }

      const result = game.checkAnswer(answer, userId);

      if (!result) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: `Game not active`,
        });
      }

      await gameRepo.save(game);
      return { answerId: result.id, gameId: game.id };
    });
  }
}
