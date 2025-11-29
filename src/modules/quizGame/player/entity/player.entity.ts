import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../../user-accounts/user/entity/user.entity';

@Entity('players')
export class PlayerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Index()
  @Column({ type: 'int', nullable: false })
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  player: User;

  static create(id: number) {
    const playerProgress = new PlayerProgress();
    playerProgress.userId = id;

    return playerProgress;
  }
}
