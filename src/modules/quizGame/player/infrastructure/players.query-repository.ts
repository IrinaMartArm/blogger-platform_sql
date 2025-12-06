import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayerProgress } from '../entity/player.entity';
import { AnswerEntity } from '../../answer/entity/answer.entity';

@Injectable()
export class PlayersQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findPlayer(userId: number): Promise<PlayerProgress | null> {
    return this.dataSource
      .createQueryBuilder(PlayerProgress, 'pp')
      .leftJoinAndMapMany('pp.answers', AnswerEntity, 'a', 'a.playerId = pp.id')
      .where('pp.userId = :userId', { userId })
      .getOne();
  }
}
