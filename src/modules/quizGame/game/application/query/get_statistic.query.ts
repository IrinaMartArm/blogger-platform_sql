import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PlayersQueryRepository } from '../../../player/infrastructure/players.query-repository';
import { GamesStatisticViewDto } from '../../api/view-dto/game_statistic.view-dto';

export class GetStatisticQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetStatisticQuery)
export class GetStatisticQueryHandler
  implements IQueryHandler<GetStatisticQuery>
{
  constructor(private readonly playerRepo: PlayersQueryRepository) {}
  async execute({ userId }: GetStatisticQuery): Promise<GamesStatisticViewDto> {
    return this.playerRepo.getGameStatistic(userId);
  }
}
