import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../user/infrastructure/users.repository';
import { EmailConfirmationsRepository } from '../../../email_confirmations/infrastructure/email_confirmations.repository';
import { randomUUID } from 'node:crypto';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
    private readonly confirmationsRepository: EmailConfirmationsRepository,
  ) {}
  async execute({ email }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.find(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid email',
        extensions: [{ message: 'bad email', field: 'email' }],
      });
    }

    const isCanConfirm = await this.confirmationsRepository.getConfirmation(
      user.id,
    );

    if (!isCanConfirm) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'confirmation code expired or already used',
        extensions: [
          {
            message: 'confirmation code expired or already used',
            field: 'email',
          },
        ],
      });
    }
    const code = randomUUID();
    const event = new UserRegisteredEvent(user.id, email, code, true);
    this.eventBus.publish(event);
  }
}
