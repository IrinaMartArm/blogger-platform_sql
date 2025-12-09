import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';

export class GetMyCurrentGameQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetMyCurrentGameQuery)
export class GetMyCurrentGameQueryHandler
  implements IQueryHandler<GetMyCurrentGameQuery>
{
  constructor(private readonly gameRepo: GameQueryRepository) {}

  async execute({ userId }: GetMyCurrentGameQuery): Promise<GameViewDto> {
    const activeGame = await this.gameRepo.findGameByPlayer(userId);

    // console.log('active game', activeGame?.id);

    if (!activeGame) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No active pair for current user',
      });
    }

    return GameViewDto.mapToView(activeGame);
  }
}
