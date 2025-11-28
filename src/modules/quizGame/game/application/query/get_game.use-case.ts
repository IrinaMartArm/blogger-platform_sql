import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';
import { GameViewDto } from '../../api/view-dto/game.view-dto';

export class GetGameQuery {
  constructor(public userId: number) {}
}

@QueryHandler(GetGameQuery)
export class GetGameQueryHandler implements IQueryHandler<GetGameQuery> {
  constructor(private readonly gameRepo: GameQueryRepository) {}

  async execute({ userId }: GetGameQuery): Promise<GameViewDto> {
    return Promise.resolve({} as GameViewDto);
  }
}
