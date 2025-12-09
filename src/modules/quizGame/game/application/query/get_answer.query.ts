import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AnswerResultViewDto } from '../../api/view-dto/game.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GameQueryRepository } from '../../infrastructure/game.query-repository';

export class GetAnswerQuery {
  constructor(
    public readonly playerId: number,
    public readonly gameId: number,
    public readonly answerId: number,
  ) {}
}

@QueryHandler(GetAnswerQuery)
export class GetAnswerQueryHandler implements IQueryHandler<GetAnswerQuery> {
  constructor(private readonly gameRepo: GameQueryRepository) {}

  async execute({
    playerId,
    answerId,
    gameId,
  }: GetAnswerQuery): Promise<AnswerResultViewDto> {
    const game = await this.gameRepo.getGame(gameId);

    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Cannot find answer`,
      });
    }

    const answer =
      game.firstPlayerProgress.userId === playerId
        ? game.firstPlayerProgress.answers.find((a) => a.id === answerId)
        : game.secondPlayerProgress?.answers.find((a) => a.id === answerId);

    if (!answer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Cannot find answer`,
      });
    }

    return AnswerResultViewDto.mapToView(answer);
  }
}
