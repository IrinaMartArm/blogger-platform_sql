import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../user/infrastructure/users.repository';
import { EmailConfirmationsRepository } from '../../../email_confirmations/infrastructure/email_confirmations.repository';
import { randomUUID } from 'node:crypto';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class EmailResendingCommand {
  constructor(public email: string) {}
}

@CommandHandler(EmailResendingCommand)
export class EmailResendingUseCase
  implements ICommandHandler<EmailResendingCommand>
{
  constructor(
    private eventBus: EventBus,
    private readonly usersRepository: UsersRepository,
    private readonly confirmationsRepository: EmailConfirmationsRepository,
  ) {}

  async execute({ email }: EmailResendingCommand) {
    const user = await this.usersRepository.find(email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'invalid email',
        extensions: [{ message: 'invalid email', field: 'email' }],
      });
    }

    const confirmation = await this.confirmationsRepository.getConfirmation(
      user.id,
    );

    if (confirmation && confirmation.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email already confirmed',
        extensions: [{ message: 'Email is already confirmed', field: 'email' }],
      });
    }

    const code = randomUUID();

    const event = new UserRegisteredEvent(user.id, email, code);
    this.eventBus.publish(event);
  }
}
