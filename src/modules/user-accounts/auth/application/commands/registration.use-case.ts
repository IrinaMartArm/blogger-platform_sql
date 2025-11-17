import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreateUserInputDto } from '../../../user/api/input-dto/users.input-dto';
import { UsersRepository } from '../../../user/infrastructure/users.repository';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../../../user/application/users.service';

export class RegistrationCommand {
  constructor(public dto: CreateUserInputDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
    private usersService: UsersService,
  ) {}

  async execute({ dto }: RegistrationCommand): Promise<void> {
    const existingByEmail = await this.usersRepository.find(dto.email);

    if (existingByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        extensions: [{ message: 'User already exists', field: 'email' }],
      });
    }

    const existingByLogin = await this.usersRepository.find(dto.login);

    if (existingByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        extensions: [{ message: 'User already exists', field: 'login' }],
      });
    }

    const userId = await this.usersService.createUser(dto);

    //async execute({ dto }: RegisterUserCommand): Promise<void> {
    //     const createdUserId = await this.commandBus.execute<
    //       CreateUserCommand,
    //       string
    //     >(new CreateUserCommand(dto)); если CreateUser тоже сделать CreateUserCommand

    const code = randomUUID();

    const event = new UserRegisteredEvent(userId, dto.email, code);
    this.eventBus.publish(event);
  }
}
