import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';
import { GameViewDto } from '../../api/view-dto/game.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetGameByIdQuery {
  constructor(
    public readonly gameId: number,
    public readonly userId: number,
  ) {}
}

@QueryHandler(GetGameByIdQuery)
export class GetGameQueryHandler implements IQueryHandler<GetGameByIdQuery> {
  constructor(private readonly gameRepo: GameQueryRepository) {}

  async execute({ gameId, userId }: GetGameByIdQuery): Promise<GameViewDto> {
    const result = await this.gameRepo.getGame(gameId);

    // console.log('GetGameByIdQuery', result?.id);

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Could not find a game`,
      });
    }

    const isFirstPlayer = result.firstPlayerProgress.userId === userId;
    const secondPlayer = result.secondPlayerProgress?.userId === userId;

    if (!isFirstPlayer && !secondPlayer) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: `Could not find a game`,
      });
    }

    return GameViewDto.mapToView(result);
  }
}
