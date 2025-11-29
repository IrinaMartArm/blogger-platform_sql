import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetGameByIdQuery {
  constructor(public gameId: number) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(private readonly gameRepo: GameQueryRepository) {}

  async execute({ gameId }: GetGameByIdQuery): Promise<GameViewDto> {
    console.log('gameId', gameId);
    const result = await this.gameRepo.getGame(gameId);
    console.log('result', result);
    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Could not find a game`,
      });
    }

    return GameViewDto.mapToView(result);
  }
}
