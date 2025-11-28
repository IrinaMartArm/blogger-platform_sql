import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayerProgress } from '../entity/player.entity';
import { TransactionalRepository } from '../../../../core/decorators/transactions/transactional';

@Injectable()
export class PlayersRepository extends TransactionalRepository<PlayerProgress> {
  constructor(dataSource: DataSource) {
    super(dataSource, PlayerProgress);
  }

  async findPlayer(userId: number): Promise<PlayerProgress | null> {
    return this.repo.findOneBy({ userId });
  }
}
