import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Game } from '../entity/game.entity';
import { GameStatus } from '../api/view-dto/game.view-dto';
import {
  GamesSortBy,
  GetGamesQueryParams,
} from '../api/input-dto/game_query_params';

@Injectable()
export class GameQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getGame(id: number) {
    return this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.player', 'fu')
      .leftJoinAndSelect('fp.answers', 'fa')
      .leftJoinAndSelect('g.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.player', 'su')
      .leftJoinAndSelect('sp.answers', 'sa')
      .orderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .where('g.id = :id', { id })
      .getOne();
  }

  async findGameByPlayer(id: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.player', 'fu')
      .leftJoinAndSelect('fp.answers', 'fa')
      .leftJoinAndSelect('g.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.player', 'su')
      .leftJoinAndSelect('sp.answers', 'sa')
      .orderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .where('(fp.userId = :id OR sp.userId = :id)', { id })
      .andWhere('g.status IN (:...statuses)', {
        statuses: [GameStatus.Active, GameStatus.PendingSecondPlayer],
      })
      .getOne();
  }

  async getGames(
    userId: number,
    query: GetGamesQueryParams,
  ): Promise<{ games: Game[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = (pageNumber - 1) * pageSize;
    const dir = sortDirection === 'ASC' ? 'ASC' : 'DESC';

    let ids: Game[];

    if (sortBy === GamesSortBy.Status) {
      const sql = `
    SELECT g.* FROM games g
    LEFT JOIN players fp ON fp.id = g."firstPlayerProgressId"
    LEFT JOIN players sp ON sp.id = g."secondPlayerProgressId"
    WHERE fp."userId" = $1 OR sp."userId" = $1
    ORDER BY 
      CASE g.status 
        WHEN 'Active' THEN 1 
        WHEN 'Finished' THEN 2 
        ELSE 3 
      END ${dir},
      g.id DESC
    LIMIT $2 OFFSET $3
  `;

      ids = await this.dataSource.query(sql, [userId, pageSize, skip]);
    } else {
      const queryBuilder = this.dataSource
        .createQueryBuilder(Game, 'g')
        .leftJoin('g.firstPlayerProgress', 'fp')
        .leftJoin('g.secondPlayerProgress', 'sp')
        .where('fp.userId = :userId OR sp.userId = :userId', { userId });

      if (sortBy === GamesSortBy.Id) {
        queryBuilder.orderBy('g.id', dir);
      } else {
        queryBuilder.orderBy('g.pairCreatedDate', dir);
      }

      ids = await queryBuilder.take(pageSize).skip(skip).getMany();
    }

    const gameIds = ids.map((g) => g.id);

    if (gameIds.length === 0) {
      return { games: [], totalCount: 0 };
    }

    const games = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoinAndSelect('g.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.player', 'fu')
      .leftJoinAndSelect('fp.answers', 'fa')
      .leftJoinAndSelect('g.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.player', 'su')
      .leftJoinAndSelect('sp.answers', 'sa')
      .where(`g.id IN (:...gameIds)`, { gameIds })
      // СОХРАНЯЕМ ПОРЯДОК: используем FIELD() для PostgreSQL
      .addOrderBy(`array_position(ARRAY[${gameIds.join(',')}]::int[], g.id)`)
      .addOrderBy('fa.addedAt', 'ASC')
      .addOrderBy('sa.addedAt', 'ASC')
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder(Game, 'g')
      .leftJoin('g.firstPlayerProgress', 'fp')
      .leftJoin('g.secondPlayerProgress', 'sp')
      .where('fp.userId = :userId OR sp.userId = :userId', { userId })
      .getCount();

    return { games, totalCount };
  }
}
