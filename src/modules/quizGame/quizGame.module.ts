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
import { QuestionsController } from './questions/api/questions.sa.controller';
import { CreateQuestionCommandHandler } from './questions/application/commands/create_question.use-case';
import { QuestionQueryRepository } from './questions/infrastructure/question.query-repository';
import { GetQuestionQueryHandler } from './questions/application/query/get_question.query';
import { DeleteQuestionCommandHandler } from './questions/application/commands/delete_question.use-case';
import { UpdateQuestionHandler } from './questions/application/commands/update_question.use-case';
import { UpdatePublishCommandHandler } from './questions/application/commands/update_publish.use-case';
import { GetQuestionsQueryHandler } from './questions/application/query/get_questions.query';

const queries = [
  GetGameQueryHandler,
  GetMyCurrentGameQueryHandler,
  GetQuestionQueryHandler,
  GetQuestionsQueryHandler,
];
const commands = [
  ConnectGameCommandHandler,
  CreateQuestionCommandHandler,
  DeleteQuestionCommandHandler,
  UpdateQuestionHandler,
  UpdatePublishCommandHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress, Question])],
  controllers: [GameController, QuestionsController],
  providers: [
    GameQueryRepository,
    GameRepository,
    PlayersRepository,
    QuestionsRepository,
    QuestionQueryRepository,
    ...queries,
    ...commands,
  ],
})
export class QuizGameModule {}
