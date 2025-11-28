import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatus } from '../api/view-dto/game.view-dto';
import { PlayerProgress } from '../../player/entity/player.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

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

  // eager — чтобы подгружался автоматически, eager: true → TypeORM всегда делает LEFT JOIN при любом запросе к Game
  //lock: 'pessimistic_write' + LEFT JOIN → PostgreSQL: "Нельзя!"
  @OneToOne(() => PlayerProgress)
  @JoinColumn({ name: 'firstPlayerProgressId' }) //владелец связи — тот, у кого есть @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress)
  @JoinColumn({ name: 'secondPlayerProgressId' })
  secondPlayerProgress: PlayerProgress | null;

  static create(playerProgressId: number): Game {
    const game = new Game();

    game.firstPlayerProgressId = playerProgressId;

    return game;
  }

  startGame(playerProgressId: number) {
    this.secondPlayerProgressId = playerProgressId;
    this.status = GameStatus.Active;
    this.startGameDate = new Date();
  }
}
