import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../../user-accounts/user/entity/user.entity';
import { AnswerEntity } from '../../answer/entity/answer.entity';

@Entity('players')
export class PlayerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Index()
  @Column({ type: 'int', nullable: false })
  userId: number;

  @OneToMany(() => AnswerEntity, (a) => a.player, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  answers: AnswerEntity[];

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  player: User;

  static create(id: number) {
    const playerProgress = new PlayerProgress();
    playerProgress.userId = id;
    playerProgress.answers = [];

    return playerProgress;
  }
}
