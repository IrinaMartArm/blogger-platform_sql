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

    if (currentPlayer.answers.length >= 5) {
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
    const totalQuestions = 5;

    const currentFinished = currentAnswers === totalQuestions;
    const opponentFinished = opponentAnswers === totalQuestions;

    if (currentFinished && opponentFinished) {
      const currentLastTime = currentPlayer.answers[4].addedAt;
      const opponentLastTime = opponent.answers[4].addedAt;

      if (currentLastTime < opponentLastTime && currentPlayer.score > 0) {
        currentPlayer.score += 1;
      } else if (currentLastTime > opponentLastTime && opponent.score > 0) {
        opponent.score += 1;
      }

      if (currentPlayer.score > opponent.score) {
        currentPlayer.resultStatus = GameResultStatus.WIN;
        opponent.resultStatus = GameResultStatus.LOSS;
      } else if (currentPlayer.score < opponent.score) {
        currentPlayer.resultStatus = GameResultStatus.LOSS;
        opponent.resultStatus = GameResultStatus.WIN;
      } else if (currentPlayer.score === opponent.score) {
        currentPlayer.resultStatus = GameResultStatus.DRAW;
        opponent.resultStatus = GameResultStatus.DRAW;
      }

      this.status = GameStatus.Finished;
      this.finishGameDate = new Date();
    }
    return answerResult;
  }

  // finishGame() {
  //   if (currentFinished && !opponentFinished) {
  //     const diff = Date.now() - currentPlayer.answers[4].addedAt.getTime();
  //
  //     const TIMEOUT = 30 * 60 * 1000;
  //
  //     if (diff > TIMEOUT) {
  //       currentPlayer.score += 1;
  //       this.status = GameStatus.Finished;
  //       this.finishGameDate = new Date();
  //     }
  //   }
  // }
}
