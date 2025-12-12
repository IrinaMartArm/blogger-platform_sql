import { Game } from '../../entity/game.entity';
import { AnswerEntity } from '../../../answer/entity/answer.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export class Player {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;
}

export class PlayerProgressDto {
  @ApiProperty({ type: () => [AnswerResultViewDto] })
  answers: AnswerResultViewDto[];

  @ApiProperty({ type: () => Player })
  player: Player;

  @ApiProperty()
  score: number;
}

export class Questions {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;
}

export class GameViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => PlayerProgressDto })
  firstPlayerProgress: PlayerProgressDto;

  @ApiProperty({ type: () => PlayerProgressDto, nullable: true })
  secondPlayerProgress: PlayerProgressDto | null;

  @ApiProperty({ type: () => [Questions], nullable: true })
  questions: Questions[] | null;

  @ApiProperty({ enum: GameStatus })
  status: GameStatus;

  @ApiProperty()
  pairCreatedDate: string | null;

  @ApiProperty()
  startGameDate: string | null;

  @ApiProperty()
  finishGameDate: string | null;

  static mapToView(game: Game): GameViewDto {
    const dto = new GameViewDto();
    dto.id = game.id.toString();
    dto.firstPlayerProgress = {
      score: game.firstPlayerProgress.score,
      answers: game.firstPlayerProgress.answers.map((a) =>
        AnswerResultViewDto.mapToView(a),
      ),
      player: {
        id: game.firstPlayerProgress.userId.toString(),
        login: game.firstPlayerProgress.player.login,
      },
    };
    dto.secondPlayerProgress = game.secondPlayerProgress
      ? {
          player: {
            id: game.secondPlayerProgress.userId.toString(),
            login: game.secondPlayerProgress.player.login,
          },
          answers: game.secondPlayerProgress.answers?.map((a) =>
            AnswerResultViewDto.mapToView(a),
          ),
          score: game.secondPlayerProgress.score,
        }
      : null;
    dto.questions = game.questions
      ? game.questions.map((q) => ({ id: q.id.toString(), body: q.body }))
      : null;
    dto.status = game.status;
    dto.pairCreatedDate = game.pairCreatedDate?.toISOString() ?? null;
    dto.startGameDate = game.startGameDate?.toISOString() ?? null;
    dto.finishGameDate = game.finishGameDate?.toISOString() ?? null;
    return dto;
  }
}

export class AnswerResultViewDto {
  @ApiProperty()
  addedAt: string;

  @ApiProperty({ enum: AnswerStatus })
  answerStatus: AnswerStatus;

  @ApiProperty()
  questionId: string;

  static mapToView(answer: AnswerEntity) {
    const dto = new AnswerResultViewDto();
    dto.questionId = answer.questionId.toString();
    dto.answerStatus = answer.answerStatus;
    dto.addedAt = answer.addedAt.toISOString();
    return dto;
  }
}
