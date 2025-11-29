import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatus } from '../api/view-dto/game.view-dto';
import { PlayerProgress } from '../../player/entity/player.entity';
import { Question } from '../../questions/entity/question.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PendingSecondPlayer,
  })
  status: GameStatus;

  @Column({ type: 'int', nullable: false })
  firstPlayerProgressId: number;

  @Column({ type: 'int', nullable: true })
  secondPlayerProgressId: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  pairCreatedDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate: Date | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  questions: Question[] | null;

  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firstPlayerProgressId' }) //владелец связи — тот, у кого есть @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'secondPlayerProgressId' })
  secondPlayerProgress: PlayerProgress | null;

  static create(playerProgressId: number): Game {
    const game = new Game();

    game.firstPlayerProgressId = playerProgressId;
    game.status = GameStatus.PendingSecondPlayer;
    game.pairCreatedDate = new Date();
    game.questions = null;

    return game;
  }

  startGame(playerProgressId: number, questions: Question[]) {
    this.secondPlayerProgressId = playerProgressId;
    this.status = GameStatus.Active;
    this.questions = questions;
    this.startGameDate = new Date();
  }
}
