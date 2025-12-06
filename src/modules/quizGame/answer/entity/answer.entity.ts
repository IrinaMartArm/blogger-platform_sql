import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswerStatus } from '../../game/api/view-dto/game.view-dto';
import { PlayerProgress } from '../../player/entity/player.entity';

@Entity('answers')
export class AnswerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  questionId: number;

  @Column({ type: 'enum', enum: AnswerStatus })
  answerStatus: AnswerStatus;

  @Column({
    type: 'timestamptz',
    nullable: false,
  })
  addedAt: Date;

  @ManyToOne(() => PlayerProgress, (p) => p.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerId' })
  player: PlayerProgress;
}
