import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayerProgress } from '../entity/player.entity';
import { GamesStatisticViewDto } from '../../game/api/view-dto/game.view-dto';
import { GetTopQueryParams } from '../../game/api/input-dto/game_query_params';
import { User } from '../../../user-accounts/user/entity/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export type TopPlayersDto = {
  id: number;
  login: string;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  sumScore: number;
  avgScores: string | number;
};

@Injectable()
export class PlayersQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getGameStatistic(userId: number): Promise<GamesStatisticViewDto> {
    const result = (await this.dataSource
      .createQueryBuilder(PlayerProgress, 'pp')
      .select([
        'COUNT(pp.id)::int as "gamesCount"',
        `COUNT(CASE WHEN pp.resultStatus = 'WIN' THEN 1 END)::int as "winsCount"`,
        `COUNT(CASE WHEN pp.resultStatus = 'LOSS' THEN 1 END)::int as "lossesCount"`,
        `COUNT(CASE WHEN pp.resultStatus = 'DRAW' THEN 1 END)::int as "drawsCount"`,
        'COALESCE(SUM(pp.score), 0)::int as "sumScore"',
        'COALESCE(AVG(pp.score), 0) as "avgScores"',
      ])
      .where('pp.userId = :userId', { userId })
      .getRawOne()) as GamesStatisticViewDto;

    return {
      sumScore: result?.sumScore || 0,
      avgScores: this.formatAvgScores(+result?.avgScores || 0),
      gamesCount: result?.gamesCount || 0,
      winsCount: result?.winsCount || 0,
      lossesCount: result?.lossesCount || 0,
      drawsCount: result?.drawsCount || 0,
    };
  }

  private formatAvgScores(value: number): number {
    const rounded = Number((Math.round(value * 100) / 100).toFixed(2));
    return rounded % 1 === 0 ? Math.floor(rounded) : rounded;
  }

  async getTop(
    query: GetTopQueryParams,
  ): Promise<{ result: TopPlayersDto[]; totalCount: number }> {
    const { pageNumber, pageSize, sort } = query;
    const skip = (pageNumber - 1) * pageSize;

    const sorting = this.parseSort(sort ?? ['avgScores desc']);

    const qb = this.dataSource
      .createQueryBuilder(PlayerProgress, 'pp')
      .leftJoin(User, 'u', 'u.id = pp.userId')
      .select([
        'u.id AS id',
        'u.login AS login',

        'COUNT(pp.id)::int AS "gamesCount"',

        `SUM(CASE WHEN pp.resultStatus = 'WIN' THEN 1 ELSE 0 END)::int AS "winsCount"`,
        `SUM(CASE WHEN pp.resultStatus = 'LOSS' THEN 1 ELSE 0 END)::int AS "lossesCount"`,
        `SUM(CASE WHEN pp.resultStatus = 'DRAW' THEN 1 ELSE 0 END)::int AS "drawsCount"`,
        `COALESCE(SUM(pp.score), 0)::int as "sumScore"`,
        `COALESCE(AVG(pp.score), 0) as "avgScores"`,
      ])
      .groupBy('u.id')
      .addGroupBy('u.login');

    console.log('sorting', sorting);

    sorting.forEach((e) =>
      qb.addOrderBy(`"${e.field}"`, e.direction as 'ASC' | 'DESC'),
    );

    const countResult: { count: number } | undefined = await this.dataSource
      .createQueryBuilder(PlayerProgress, 'pp')
      .select('COUNT(DISTINCT pp.userId)::int as count')
      .getRawOne();

    const totalCount = Number(countResult?.count || 0);

    const result: TopPlayersDto[] = await qb
      .limit(pageSize)
      .offset(skip)
      .getRawMany();

    return {
      result: result.map((i) => ({
        ...i,
        avgScores: this.formatAvgScores(Number(i.avgScores) || 0),
      })),
      totalCount,
    };
  }

  private parseSort(sort: string[]) {
    const allowedFields = [
      'avgScores',
      'sumScore',
      'winsCount',
      'lossesCount',
      'drawsCount',
      'gamesCount',
    ];

    return sort.map((e) => {
      const [field, direction] = e.split(' ');
      if (!allowedFields.includes(field)) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: `Invalid field ${field} for ${direction}`,
        });
      }
      return {
        field,
        direction: direction.toUpperCase() ?? 'DESC',
      };
    });
  }
}
