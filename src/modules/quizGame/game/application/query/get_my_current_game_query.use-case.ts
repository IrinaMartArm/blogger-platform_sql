import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';

export class GetMyCurrentGameQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetMyCurrentGameQuery)
export class GetMyCurrentGameQueryHandler
  implements IQueryHandler<GetMyCurrentGameQuery>
{
  constructor() {}

  async execute({ userId }: GetMyCurrentGameQuery): Promise<GameViewDto> {
    console.log(userId);
    return Promise.resolve({} as GameViewDto);
  }
}
