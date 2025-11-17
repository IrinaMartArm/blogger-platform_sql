import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BcryptService } from '../bcrypt.service';
import { NewPasswordInputDto } from '../../../user/api/input-dto/users.input-dto';
import { ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user/infrastructure/users.repository';
import { EmailConfirmationsRepository } from '../../../email_confirmations/infrastructure/email_confirmations.repository';

export class NewPasswordCommand {
  constructor(public dto: NewPasswordInputDto) {}
}

export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
    private readonly confirmationsRepository: EmailConfirmationsRepository,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<void> {
    const confirmation =
      await this.confirmationsRepository.findByConfirmationCode(
        dto.recoveryCode,
      );
    if (!confirmation) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Invalid confirmation code',
        extensions: [{ message: 'invalid code', field: 'code' }],
      });
    }

    if (!confirmation.isRecoveryCodeValid()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code expired or already used',
        extensions: [
          {
            message: 'Confirmation code expired or already used',
            field: 'code',
          },
        ],
      });
    }

    const user = await this.usersRepository.findById(confirmation.userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    const passwordHash = await this.bcryptService.createHash(dto.newPassword);

    user.updatePassword(passwordHash);
    confirmation.deactivatePasswordRecovery();

    await this.usersRepository.save(user);
    await this.confirmationsRepository.save(confirmation);
  }
}
