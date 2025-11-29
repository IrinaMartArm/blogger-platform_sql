import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game/entity/game.entity';
import { GameController } from './game/api/game.controller';
import { GameQueryRepository } from './game/infrastructure/game.query-repository';
import { GetGameQueryHandler } from './game/application/query/get_game_by_id.use-case';
import { PlayerProgress } from './player/entity/player.entity';
import { ConnectGameCommandHandler } from './game/application/commands/connect_game.use-case';
import { PlayersRepository } from './player/infrastructure/players.repository';
import { GameRepository } from './game/infrastructure/game.repository';
import { Question } from './questions/entity/question.entity';
import { GetMyCurrentGameQueryHandler } from './game/application/query/get_my_current_game_query.use-case';
import { QuestionsRepository } from './questions/infrastructure/questions.repository';

const queries = [GetGameQueryHandler, GetMyCurrentGameQueryHandler];
const commands = [ConnectGameCommandHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress, Question])],
  controllers: [GameController],
  providers: [
    GameQueryRepository,
    GameRepository,
    PlayersRepository,
    QuestionsRepository,
    ...queries,
    ...commands,
  ],
})
export class QuizGameModule {}
