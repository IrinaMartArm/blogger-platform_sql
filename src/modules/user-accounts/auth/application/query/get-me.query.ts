import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeViewDto } from '../../../user/api/view-dto/user.view-dto';
import { UsersQueryRepository } from '../../../user/infrastructure/users.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetMeQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, MeViewDto> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute({ userId }: GetMeQuery): Promise<MeViewDto> {
    const me = await this.usersQueryRepository.getMe(userId);
    if (!me) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return me;
  }
}
