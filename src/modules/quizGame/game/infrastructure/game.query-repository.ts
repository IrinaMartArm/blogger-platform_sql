import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class GameQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getGame(id: number) {
    const qb = this.dataSource.createQueryBuilder();
  }
}
