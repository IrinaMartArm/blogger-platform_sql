import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Device } from '../../security_devices/entity/device.entity';
import { EmailConfirmations } from '../../email_confirmations/domain/email_confirmations.entity';
import { BaseEntity } from '../../../../core/entities/baseEntity';

@Entity('users')
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
    nullable: false,
    collation: 'C',
  })
  login: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  passwordHash: string;

  @OneToMany(() => Device, (device) => device.user, { onDelete: 'CASCADE' })
  devices: Device[];

  @OneToOne(() => EmailConfirmations, (email) => email.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  emailConfirmations: EmailConfirmations;

  static create(login: string, email: string, pass: string): User {
    const user = new User();
    user.email = email;
    user.login = login;
    user.passwordHash = pass;
    return user;
  }

  updateProfile(login?: string, email?: string): void {
    if (login) this.login = login;
    if (email) this.email = email;
  }

  updatePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
  }
}
