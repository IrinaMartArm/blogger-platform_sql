import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../../security_devices/infrastructure/devices.repository';
import { DecodedRefreshToken } from '../../api/input-dto/login.input-dto';

export class LogoutCommand {
  constructor(public readonly payload: DecodedRefreshToken) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private readonly deviceRepo: DevicesRepository) {}

  async execute({ payload }: LogoutCommand): Promise<void> {
    const { currentUserId, deviceId } = payload;

    const userId = Number(currentUserId);

    await this.deviceRepo.deleteDevice(deviceId, userId);
  }
}
