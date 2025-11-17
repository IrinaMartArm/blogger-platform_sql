import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../users.query-repository';

export class GetUserQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetUserQuery)
export class GetUserQueryUseCase implements IQueryHandler<GetUserQuery> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute({ id }: GetUserQuery) {
    return this.usersQueryRepository.getUserById(id);
  }
}
