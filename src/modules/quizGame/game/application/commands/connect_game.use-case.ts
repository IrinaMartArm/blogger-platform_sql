import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Game } from '../../entity/game.entity';
import { PlayerProgress } from '../../../player/entity/player.entity';
import { PlayersRepository } from '../../../player/infrastructure/players.repository';
import { DataSource } from 'typeorm';
import { QuestionsRepository } from '../../../questions/infrastructure/questions.repository';

export class ConnectGameCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(ConnectGameCommand)
export class ConnectGameCommandHandler
  implements ICommandHandler<ConnectGameCommand>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly gameRepo: GameRepository,
    private readonly playerRepo: PlayersRepository,
    private readonly questionsRepo: QuestionsRepository,
  ) {}

  async execute({ userId }: ConnectGameCommand): Promise<number> {
    return this.dataSource.transaction('REPEATABLE READ', async (manager) => {
      //✔ commit срабатывает после успешного выполнения callback
      // ✔ rollback срабатывает, если callback выбрасывает ошибку
      const gameRepository = this.gameRepo.withTransaction(manager);
      const playerRepository = this.playerRepo.withTransaction(manager);

      const player = await playerRepository.findPlayer(userId);
      if (player) {
        throw new DomainException({
          code: DomainExceptionCode.Forbidden,
          message: 'You are have active game',
        });
      }

      const newPlayer = PlayerProgress.create(userId);
      await playerRepository.save(newPlayer);

      const freeGame = await gameRepository.findFreeGame();

      if (freeGame) {
        const questions = await this.questionsRepo.getQuestions();
        freeGame.startGame(newPlayer.id, questions);
        await gameRepository.save(freeGame);
        return freeGame.id;
      }

      const newGame = Game.create(newPlayer.id);
      await gameRepository.save(newGame);

      return newGame.id;
    });
  }
}
//🎯 Простой аналогия
// DataSource.transaction → как запуск функции "сделать заказ"
// Manager → официант: "всё делаю в рамках этого заказа"
// TransactionalRepository → твоя тетрадка с рецептами: просто даёт инструкции официанту
// save/find → приготовление блюд
// commit → заказ завершён
// rollback → заказ отменён
