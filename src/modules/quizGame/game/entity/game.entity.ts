import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswerStatus, GameStatus } from '../api/view-dto/game.view-dto';
import {
  GameResultStatus,
  PlayerProgress,
} from '../../player/entity/player.entity';
import { Question } from '../../questions/entity/question.entity';
import { AnswerEntity } from '../../answer/entity/answer.entity';

const TOTAL_QUESTIONS = 5;

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

  @Column({ type: 'varchar', nullable: true })
  finishTimeoutJobId: string | null;

  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE', cascade: true })
  @JoinColumn({ name: 'firstPlayerProgressId' }) //владелец связи — тот, у кого есть @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, { onDelete: 'CASCADE', cascade: true })
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

  checkAnswer(answer: string, userId: number) {
    if (
      !this.questions ||
      !this.firstPlayerProgress ||
      !this.secondPlayerProgress ||
      this.status !== GameStatus.Active
    ) {
      return null;
    }

    const currentPlayer =
      this.firstPlayerProgress.userId === userId
        ? this.firstPlayerProgress
        : this.secondPlayerProgress;

    const opponent =
      currentPlayer === this.firstPlayerProgress
        ? this.secondPlayerProgress
        : this.firstPlayerProgress;

    if (currentPlayer.answers.length >= TOTAL_QUESTIONS) {
      return null;
    }

    const index = currentPlayer.answers.length;
    const question = this.questions[index];

    const isCorrect = question.correctAnswers
      .map((a) => a.trim().toLowerCase())
      .includes(answer.trim().toLowerCase());

    const answerResult = new AnswerEntity();
    answerResult.questionId = question.id;
    answerResult.answerStatus = isCorrect
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;
    answerResult.addedAt = new Date();
    answerResult.player = currentPlayer;

    currentPlayer.answers.push(answerResult);

    if (isCorrect) {
      currentPlayer.score += 1;
    }

    const currentAnswers = currentPlayer.answers.length;
    const opponentAnswers = opponent.answers.length;

    const currentFinished = currentAnswers === TOTAL_QUESTIONS;
    const opponentFinished = opponentAnswers === TOTAL_QUESTIONS;

    if (currentFinished && opponentFinished) {
      this.countPoints();
    }
    return answerResult;
  }

  updateJobId(jobId: string) {
    this.finishTimeoutJobId = jobId;
  }

  finishGameWithMissingAnswers() {
    const fp = this.firstPlayerProgress;
    const sp = this.secondPlayerProgress!;

    for (const pl of [fp, sp]) {
      while (pl.answers.length < TOTAL_QUESTIONS) {
        const missingIndex = pl.answers.length;
        const answerResult = new AnswerEntity();
        answerResult.answerStatus = AnswerStatus.Incorrect;
        answerResult.addedAt = new Date();
        answerResult.questionId = this.questions![missingIndex].id;
        answerResult.player = pl;

        pl.answers.push(answerResult);
      }
    }

    this.countPoints();
  }

  countPoints() {
    const first = this.firstPlayerProgress;
    const second = this.secondPlayerProgress!;

    const fpLastTime = first.answers[4].addedAt;
    const spLastTime = second.answers[4].addedAt;

    if (fpLastTime < spLastTime && first.score > 0) {
      first.score += 1;
    } else if (fpLastTime > spLastTime && second.score > 0) {
      second.score += 1;
    }

    if (first.score > second.score) {
      first.resultStatus = GameResultStatus.WIN;
      second.resultStatus = GameResultStatus.LOSS;
    } else if (first.score < second.score) {
      first.resultStatus = GameResultStatus.LOSS;
      second.resultStatus = GameResultStatus.WIN;
    } else if (first.score === second.score) {
      first.resultStatus = GameResultStatus.DRAW;
      second.resultStatus = GameResultStatus.DRAW;
    }

    this.finishTimeoutJobId = null;
    this.status = GameStatus.Finished;
    this.finishGameDate = new Date();
  }
}
