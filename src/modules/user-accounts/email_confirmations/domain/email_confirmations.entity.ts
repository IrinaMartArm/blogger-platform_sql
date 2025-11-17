import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity('email_confirmations')
export class EmailConfirmations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  userId: number;

  @Column()
  isEmailConfirmed: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  confirmationCode: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expirationDate: Date | null;

  @Column()
  isPasswordRecoveryActive: boolean;

  @OneToOne(() => User, (user) => user.emailConfirmations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' }) // ← указывает, что внешний ключ в колонке userId
  user: User;

  static createConfirmation(
    userId: number,
    code: string,
    isRecovery: boolean = false,
  ) {
    const confirmation = new EmailConfirmations();
    confirmation.userId = userId;
    confirmation.confirmationCode = code;
    confirmation.isEmailConfirmed = false;
    confirmation.isPasswordRecoveryActive = isRecovery;
    confirmation.expirationDate = new Date(Date.now() + 90 * 60 * 1000);

    return confirmation;
  }

  confirmEmail() {
    this.isEmailConfirmed = true;
    this.confirmationCode = null;
    this.expirationDate = null;
  }

  isRecoveryCodeValid(): boolean {
    return (
      this.isPasswordRecoveryActive &&
      !!this.expirationDate &&
      new Date(this.expirationDate) > new Date()
    );
  }

  deactivatePasswordRecovery(): void {
    this.isPasswordRecoveryActive = false;
    this.confirmationCode = null;
    this.expirationDate = null;
  }

  isConfirmationCodeValid(): boolean {
    return (
      !this.isEmailConfirmed &&
      !!this.confirmationCode &&
      !!this.expirationDate &&
      new Date(this.expirationDate) > new Date()
    );
  }
}
