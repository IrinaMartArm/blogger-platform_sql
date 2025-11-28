import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailConfirmationsRepository } from '../../../email_confirmations/infrastructure/email_confirmations.repository';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private readonly emailConfirmationsRepository: EmailConfirmationsRepository,
  ) {}

  async execute({ code }: ConfirmRegistrationCommand): Promise<void> {
    const confirmation =
      await this.emailConfirmationsRepository.findByConfirmationCode(code);

    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [{ message: 'Invalid confirmation code', field: 'code' }],
      });
    }

    console.log('confirmation', confirmation);

    if (!confirmation.isConfirmationCodeValid()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired or already used',
        extensions: [
          {
            message: 'confirmation code expired or already used',
            field: 'code',
          },
        ],
      });
    }

    confirmation.confirmEmail();
    await this.emailConfirmationsRepository.save(confirmation);
  }
}
