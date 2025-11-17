import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Device } from '../entity/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async save(device: Device): Promise<void> {
    await this.deviceRepository.save(device);
  }

  async findDeviceById(deviceId: string): Promise<Device | null> {
    return await this.deviceRepository.findOne({
      where: { deviceId },
    });
  }

  async deleteDevice(deviceId: string, userId: number): Promise<boolean> {
    const result = await this.deviceRepository.delete({
      deviceId,
      userId,
    });
    return (result.affected || 0) > 0;
  }

  async deleteAllDevices(
    userId: number,
    currentDeviceId: string,
  ): Promise<void> {
    await this.deviceRepository.delete({
      userId,
      deviceId: Not(currentDeviceId),
    });
  }

  async getSession(deviceId: string, userId: number): Promise<Device | null> {
    return await this.deviceRepository.findOne({
      where: { deviceId, userId },
    });
  }
}
