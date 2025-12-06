import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AnswerResultViewDto } from '../../api/view-dto/game.view-dto';
import { PlayersQueryRepository } from '../../../player/infrastructure/players.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetAnswerQuery {
  constructor(
    public readonly playerId: number,
    public readonly answerId: number,
  ) {}
}

@QueryHandler(GetAnswerQuery)
export class GetAnswerQueryHandler implements IQueryHandler<GetAnswerQuery> {
  constructor(private readonly playersRepo: PlayersQueryRepository) {}

  async execute({
    answerId,
    playerId,
  }: GetAnswerQuery): Promise<AnswerResultViewDto> {
    const player = await this.playersRepo.findPlayer(playerId);

    if (!player) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Cannot find answer`,
      });
    }

    const answer = player.answers.find((a) => a.questionId === answerId);

    if (!answer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Cannot find answer`,
      });
    }

    return AnswerResultViewDto.mapToView(answer);
  }
}
