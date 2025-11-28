import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameRepository } from '../../infrastructure/game.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Game } from '../../entity/game.entity';
import { PlayerProgress } from '../../../player/entity/player.entity';
import { PlayersRepository } from '../../../player/infrastructure/players.repository';
import { DataSource } from 'typeorm';

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
  ) {}

  async execute({ userId }: ConnectGameCommand): Promise<Game> {
    return this.dataSource.transaction<Game>(
      'REPEATABLE READ',
      async (manager) => {
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
          freeGame.startGame(newPlayer.id);
          await playerRepository.save(newPlayer);
          return freeGame;
        }

        const newGame = Game.create(newPlayer.id);
        await gameRepository.save(newGame);

        return newGame;
      },
    );
  }
}
