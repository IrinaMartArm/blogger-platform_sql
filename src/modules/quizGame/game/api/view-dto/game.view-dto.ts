import { Game } from '../../entity/game.entity';
import { AnswerEntity } from '../../../answer/entity/answer.entity';

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressDto;
  secondPlayerProgress: PlayerProgressDto | null;
  questions: Questions[] | null;
  status: GameStatus;
  pairCreatedDate: string | null;
  startGameDate: string | null;
  finishGameDate: string | null;

  static mapToView(game: Game): GameViewDto {
    const dto = new GameViewDto();
    dto.id = game.id.toString();
    dto.firstPlayerProgress = {
      score: game.firstPlayerProgress.score,
      answers: game.firstPlayerProgress.answers.map((a) =>
        AnswerResultViewDto.mapToView(a),
      ),
      // answers: [...game.firstPlayerProgress.answers]
      //   .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
      //   .map((e) => AnswerResultViewDto.mapToView(e)),
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
          // answers: [...game.secondPlayerProgress.answers]
          //   .sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
          //   .map((e) => AnswerResultViewDto.mapToView(e)),

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

export type Player = {
  id: string;
  login: string;
};

export type PlayerProgressDto = {
  answers: AnswerResultViewDto[];
  player: Player;
  score: number;
};

export type Questions = {
  id: string;
  body: string;
};

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

export class AnswerResultViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;

  static mapToView(answer: AnswerEntity) {
    const dto = new AnswerResultViewDto();
    dto.questionId = answer.questionId.toString();
    dto.answerStatus = answer.answerStatus;
    dto.addedAt = answer.addedAt.toISOString();
    return dto;
  }
}
