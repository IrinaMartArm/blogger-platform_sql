export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressDto;
  secondPlayerProgress?: PlayerProgressDto;
  questions?: Questions[];
  status: GameStatus;
  pairCreatedDate?: string;
  startGameDate?: string;
  finishGameDate?: string;
}

export type Answers = {
  questionId: string;
  answerStatus: string;
  addedAt: string;
};

export type Player = {
  id: string;
  login: string;
};

export type PlayerProgressDto = {
  answers: Answers[];
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
