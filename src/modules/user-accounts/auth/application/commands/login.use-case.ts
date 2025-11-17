import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/token.constants';
import { randomUUID } from 'node:crypto';
import { DevicesRepository } from '../../../security_devices/infrastructure/devices.repository';
import { DecodedRefreshToken } from '../../api/input-dto/login.input-dto';
import { Device } from '../../../security_devices/entity/device.entity';

export class LoginCommand {
  constructor(
    public readonly currentUserId: number,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
    private readonly devicesRepository: DevicesRepository,
  ) {}
  async execute({
    currentUserId,
    ip,
    userAgent,
  }: LoginCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = randomUUID();

    const accessToken = this.accessTokenContext.sign({
      currentUserId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      currentUserId,
      deviceId,
      ip,
    });

    const decodedRefreshToken: DecodedRefreshToken =
      this.refreshTokenContext.decode(refreshToken);
    const expiresAt = new Date(decodedRefreshToken.exp * 1000);

    const devise = Device.create({
      userId: currentUserId,
      deviceId,
      ip,
      userAgent,
      expiresAt,
      lastActive: new Date(),
    });

    await this.devicesRepository.save(devise);

    return { accessToken, refreshToken };
  }
}
