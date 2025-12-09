import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TopPlayersViewDto } from '../../api/view-dto/game.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetTopQueryParams } from '../../api/input-dto/game_query_params';
import { PlayersQueryRepository } from '../../../player/infrastructure/players.query-repository';

export class GetTopPlayersQuery {
  constructor(public readonly query: GetTopQueryParams) {}
}

@QueryHandler(GetTopPlayersQuery)
export class GetTopPlayersQueryHandler
  implements IQueryHandler<GetTopPlayersQuery>
{
  constructor(private readonly playersRepo: PlayersQueryRepository) {}

  async execute({
    query,
  }: GetTopPlayersQuery): Promise<PaginatedViewDto<TopPlayersViewDto[]>> {
    const { pageSize, pageNumber } = query;
    const { result, totalCount } = await this.playersRepo.getTop(query);

    const items = result.map((i) => TopPlayersViewDto.mapToView(i));

    return PaginatedViewDto.mapToView({
      items,
      size: pageSize,
      page: pageNumber,
      totalCount,
    });
  }
}
