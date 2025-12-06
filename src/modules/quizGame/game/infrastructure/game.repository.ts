import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Game } from '../entity/game.entity';
import { GameStatus } from '../api/view-dto/game.view-dto';
import { TransactionalRepository } from '../../../../core/decorators/transactions/transactional';

@Injectable()
export class GameRepository extends TransactionalRepository<Game> {
  constructor(dataSource: DataSource) {
    super(dataSource, Game);
  }

  async findFreeGame(): Promise<Game | null> {
    return this.repo.findOne({
      where: { status: GameStatus.PendingSecondPlayer },
      lock: { mode: 'pessimistic_write' },
      order: { pairCreatedDate: 'ASC' },
    });
  }

  async findActiveGameByUserId(userId: number) {
    return this.repo
      .createQueryBuilder('game')
      .setLock('pessimistic_write', undefined, ['game'])
      .innerJoinAndSelect('game.firstPlayerProgress', 'first')
      .leftJoinAndSelect('game.secondPlayerProgress', 'second')
      .leftJoinAndSelect('first.answers', 'fa')
      .leftJoinAndSelect('second.answers', 'sa')
      .where('game.status = :status', { status: GameStatus.Active })
      .andWhere('(first.userId = :userId OR second.userId = :userId)', {
        userId,
      })
      .orderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .getOne();
  }

  async findActiveGameByPlayer(id: number) {
    return (
      this.repo
        .createQueryBuilder('game')
        // .setLock('pessimistic_write')
        .innerJoinAndSelect('game.firstPlayerProgress', 'first')
        .innerJoinAndSelect('game.secondPlayerProgress', 'second')
        .leftJoinAndSelect('first.answers', 'fa')
        .leftJoinAndSelect('second.answers', 'sa')
        .where('game.status = :status', { status: GameStatus.Active })
        .andWhere(
          '(game.firstPlayerProgressId = :id OR game.secondPlayerProgressId = :id)',
          {
            id,
          },
        )
        .orderBy('fa.id', 'ASC')
        .addOrderBy('sa.id', 'ASC')
        .getOne()
    );
  }

  async findGameByUserId(userId: number) {
    return this.repo
      .createQueryBuilder('game')
      .setLock('pessimistic_write', undefined, ['game'])
      .innerJoin('game.firstPlayerProgress', 'first')
      .leftJoin('game.secondPlayerProgress', 'second')
      .where('game.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.PendingSecondPlayer],
      })
      .andWhere('(first.userId = :userId OR second.userId = :userId)', {
        userId,
      })
      .getOne();
  }
}
