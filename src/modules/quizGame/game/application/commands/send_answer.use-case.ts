import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameRepository } from '../../infrastructure/game.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

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
    @InjectQueue('game-finish') private readonly finishQueue: Queue,
  ) {}

  async execute({ userId, answer }: SendAnswerCommand) {
    const result = await this.dataSource.transaction(
      'REPEATABLE READ',
      async (manager) => {
        const gameRepo = this.gameRepository.withTransaction(manager);

        const game = await gameRepo.findActiveGameByUserId(userId);

        if (!game) {
          throw new DomainException({
            code: DomainExceptionCode.Forbidden,
            message: `Game not active`,
          });
        }

        const newAnswer = game.checkAnswer(answer, userId);

        if (!newAnswer) {
          throw new DomainException({
            code: DomainExceptionCode.Forbidden,
            message: `Game not active`,
          });
        }

        await gameRepo.save(game);

        const isBothFinish =
          game.firstPlayerProgress.answers.length === 5 &&
          game.secondPlayerProgress?.answers.length === 5;

        const isOneFinish =
          game.firstPlayerProgress.answers.length === 5 ||
          game.secondPlayerProgress?.answers.length === 5;

        const needStartTimeout = !isBothFinish && isOneFinish;

        const existingJobId = game.finishTimeoutJobId;

        if (existingJobId) {
          const job = await this.finishQueue.getJob(existingJobId);
          if (job) {
            await job.remove();
          }
        }

        if (needStartTimeout) {
          game.updateJobId(`game_finish_${game.id}`);
          await gameRepo.save(game);
        }

        return { answerId: newAnswer.id, gameId: game.id, needStartTimeout };
      },
    );

    if (result.needStartTimeout) {
      await this.finishQueue.add(
        'finish_timeout',
        { gameId: result.gameId, jobId: `game_finish_${result.gameId}` },
        {
          delay: 10000,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: true,
          jobId: `game_finish_${result.gameId}`,
        },
      );
    }

    return result;
  }
}
