import { IsDate, IsString } from 'class-validator';

export class DeviceInputDto {
  @IsString()
  userId: number;

  @IsString()
  deviceId: string;

  @IsString()
  ip: string;

  @IsString()
  userAgent: string;

  @IsDate()
  lastActive: Date;

  @IsDate()
  expiresAt: Date;
}
