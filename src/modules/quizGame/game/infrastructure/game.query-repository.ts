import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Game } from '../entity/game.entity';
import { PlayerProgress } from '../../player/entity/player.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';
import { AnswerEntity } from '../../answer/entity/answer.entity';
import { GameStatus } from '../api/view-dto/game.view-dto';

@Injectable()
export class GameQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getGame(id: number) {
    return this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndMapOne(
        'g.firstPlayerProgress',
        PlayerProgress,
        'fp',
        'fp.id = g.firstPlayerProgressId',
      )
      .leftJoinAndMapOne('fp.player', User, 'fu', 'fu.id = fp.userId')
      .leftJoinAndMapMany(
        'fp.answers',
        AnswerEntity,
        'fa',
        'fa.playerId = fp.id',
      )
      .leftJoinAndMapOne(
        'g.secondPlayerProgress',
        PlayerProgress,
        'sp',
        'sp.id = g.secondPlayerProgressId',
      )
      .leftJoinAndMapOne('sp.player', User, 'su', 'su.id = sp.userId')
      .leftJoinAndMapMany(
        'sp.answers',
        AnswerEntity,
        'sa',
        'sa.playerId = sp.id',
      )
      .orderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .where('g.id = :id', { id })
      .getOne();
  }

  async findGameByPlayer(id: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndMapOne(
        'g.firstPlayerProgress',
        PlayerProgress,
        'fp',
        'fp.id = g.firstPlayerProgressId',
      )
      .leftJoinAndMapOne('fp.player', User, 'fu', 'fu.id = fp.userId')
      .leftJoinAndMapMany(
        'fp.answers',
        AnswerEntity,
        'fa',
        'fp.id = fa.playerId',
      )
      .leftJoinAndMapOne(
        'g.secondPlayerProgress',
        PlayerProgress,
        'sp',
        'sp.id = g.secondPlayerProgressId',
      )
      .leftJoinAndMapOne('sp.player', User, 'su', 'su.id = sp.userId')
      .leftJoinAndMapMany(
        'sp.answers',
        AnswerEntity,
        'sa',
        'sp.id = sa.playerId',
      )
      .orderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .where('(fp.userId = :id OR sp.userId = :id)', { id })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.PendingSecondPlayer],
      })
      .getOne();
  }
}
