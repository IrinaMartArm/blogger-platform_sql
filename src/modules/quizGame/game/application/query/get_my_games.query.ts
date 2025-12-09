import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { GetGamesQueryParams } from '../../api/input-dto/game_query_params';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';

export class GetMyGamesQuery {
  constructor(
    public readonly userId: number,
    public readonly query: GetGamesQueryParams,
  ) {}
}

@QueryHandler(GetMyGamesQuery)
export class GetMyGamesQueryHandler implements IQueryHandler<GetMyGamesQuery> {
  constructor(private readonly gameQueryRepo: GameQueryRepository) {}

  async execute({
    userId,
    query,
  }: GetMyGamesQuery): Promise<PaginatedViewDto<GameViewDto[]>> {
    const { pageSize, pageNumber } = query;

    const { games, totalCount } = await this.gameQueryRepo.getGames(
      userId,
      query,
    );

    const items = games.map((game) => GameViewDto.mapToView(game));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      size: pageSize,
      page: pageNumber,
    });
  }
}
