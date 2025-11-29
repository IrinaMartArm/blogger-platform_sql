import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Game } from '../entity/game.entity';
import { PlayerProgress } from '../../player/entity/player.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';

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
      .leftJoinAndMapOne(
        'g.secondPlayerProgress',
        PlayerProgress,
        'sp',
        'sp.id = g.secondPlayerProgressId',
      )
      .leftJoinAndMapOne('sp.player', User, 'su', 'su.id = sp.userId')
      .select()
      .where('g.id = :id', { id })
      .getOne();
  }

  async getGame2(id: number) {
    return this.dataSource
      .createQueryBuilder()
      .from(Game, 'g')
      .leftJoinAndMapOne(
        'g.firstPlayerProgress',
        PlayerProgress,
        'fp',
        'fp.id = g.firstPlayerProgressId',
      )
      .leftJoinAndMapOne('fp.player', User, 'fu', 'fu.id = fp.userId')
      .leftJoinAndMapOne(
        'g.secondPlayerProgress',
        PlayerProgress,
        'sp',
        'sp.id = g.secondPlayerProgressId',
      )
      .leftJoinAndMapOne('sp.player', User, 'su', 'su.id = sp.userId')
      .select()
      .where('g.id = :id', { id })
      .getOne();
  }
}
