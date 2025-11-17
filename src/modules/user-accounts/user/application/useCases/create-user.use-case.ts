import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreateUserInputDto } from '../../api/input-dto/users.input-dto';
import { UsersService } from '../users.service';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private usersService: UsersService,
  ) {}

  async execute({ dto }: CreateUserCommand) {
    const userByEmail = await this.usersRepository.find(dto.email);

    if (userByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        extensions: [{ message: 'User already exists', field: 'email' }],
      });
    }

    const userByLogin = await this.usersRepository.find(dto.login);

    if (userByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        extensions: [{ message: 'User already exists', field: 'login' }],
      });
    }

    return this.usersService.createUser(dto);
  }
}
