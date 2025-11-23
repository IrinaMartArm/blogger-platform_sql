import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { DeviceInputDto } from '../api/input-dto/device.input-dto';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'varchar', length: 200, nullable: false, unique: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  ip: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  userAgent: string;

  @Column({ type: 'timestamptz', nullable: false })
  lastActive: Date;

  @Column({ type: 'timestamptz', nullable: false })
  expiresAt: Date;

  @ManyToOne(() => User, (user: User) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // ← указывает, что внешний ключ в колонке userId
  user: User;

  static create(dto: DeviceInputDto): Device {
    const device = new Device();
    device.userId = dto.userId;
    device.deviceId = dto.deviceId;
    device.userAgent = dto.userAgent;
    device.ip = dto.ip;
    device.expiresAt = dto.expiresAt;
    device.lastActive = dto.lastActive;
    return device;
  }

  updateSession(expiresAt: Date) {
    this.expiresAt = expiresAt;
    this.lastActive = new Date();
  }
}
