import { UserRegisteredEvent } from '../user-registered.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailConfirmationsRepository } from '../../../../email_confirmations/infrastructure/email_confirmations.repository';
import { EmailConfirmations } from '../../../../email_confirmations/domain/email_confirmations.entity';

@EventsHandler(UserRegisteredEvent)
export class CreateEmailConfirmationHandler
  implements IEventHandler<UserRegisteredEvent>
{
  constructor(
    private readonly confirmationsRepository: EmailConfirmationsRepository,
  ) {}

  async handle({ userId, code }: UserRegisteredEvent) {
    const confirmation = EmailConfirmations.createConfirmation(userId, code);
    await this.confirmationsRepository.save(confirmation);
  }
}
