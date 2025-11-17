import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserFromRequest } from '../../decorators/param/getUserFromRequest';
import { GetDevicesQuery } from '../infrastructure/query/get-devices.query';
import { DeleteDevicesCommand } from '../application/use-cases/delete-devices.use-case';
import { DeleteDeviceCommand } from '../application/use-cases/delete-device.use-case';
import { RefreshTokenGuard } from '../../auth/guards/bearer/refresh-token-auth.guard';
import { DecodedRefreshToken } from '../../auth/api/input-dto/login.input-dto';

@UseGuards(RefreshTokenGuard)
@Controller('security')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('devices')
  async getDevices(
    @GetUserFromRequest('refresh') user: DecodedRefreshToken,
  ): Promise<any> {
    if (!user) {
      throw new NotFoundException();
    }
    return this.queryBus.execute(new GetDevicesQuery(user.currentUserId));
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevices(
    @GetUserFromRequest('refresh') user: DecodedRefreshToken,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteDevicesCommand(Number(user.currentUserId), user.deviceId),
    );
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @Param('id') id: string,
    @GetUserFromRequest('refresh') user: DecodedRefreshToken,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteDeviceCommand(id, Number(user.currentUserId)),
    );
  }
}
