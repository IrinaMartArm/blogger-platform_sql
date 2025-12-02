import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayerProgress } from '../entity/player.entity';

@Injectable()
export class PlayersQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findPlayer(userId: number): Promise<PlayerProgress | null> {
    return this.dataSource
      .createQueryBuilder(PlayerProgress, 'pp')
      .where({ userId })
      .getOne();
  }
}
