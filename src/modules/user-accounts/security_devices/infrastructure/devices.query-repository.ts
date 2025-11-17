import { Injectable } from '@nestjs/common';
import { DevicesViewDto } from '../api/view-dto/devices.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entity/device.entity';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async findDevicesByUserId(userId: number): Promise<DevicesViewDto[]> {
    const items = await this.deviceRepository.find({
      where: { userId },
      order: { lastActive: 'DESC' },
    });
    return items.map((item) => DevicesViewDto.mapToView(item));
  }
}
