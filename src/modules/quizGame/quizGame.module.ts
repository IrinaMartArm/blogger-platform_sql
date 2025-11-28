import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game/entity/game.entity';
import { GameController } from './game/api/game.controller';
import { GameQueryRepository } from './game/infrastructure/game.query-repository';
import { GetGameQueryHandler } from './game/application/query/get_game.use-case';
import { PlayerProgress } from './player/entity/player.entity';
import { ConnectGameCommandHandler } from './game/application/commands/connect_game.use-case';
import { PlayersRepository } from './player/infrastructure/players.repository';
import { GameRepository } from './game/infrastructure/game.repository';

const queries = [GetGameQueryHandler];
const commands = [ConnectGameCommandHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Game, PlayerProgress])],
  controllers: [GameController],
  providers: [
    GameQueryRepository,
    GameRepository,
    PlayersRepository,
    ...queries,
    ...commands,
  ],
})
export class QuizGameModule {}
