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

  async findGame(id: number): Promise<Game | null> {
    return this.repo
      .createQueryBuilder('g')
      .where('g.firstPlayerId = :id', { id })
      .orWhere('g.secondPlayerId = :id', { id })
      .getOne();
  }
}
