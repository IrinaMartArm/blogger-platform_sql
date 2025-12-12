import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/jwt-auth.guard';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { AnswerResultViewDto, GameViewDto } from './view-dto/game.view-dto';
import { GetGameByIdQuery } from '../application/query/get_game_by_id.query';
import { ConnectGameCommand } from '../application/commands/connect_game.use-case';
import { GetMyCurrentGameQuery } from '../application/query/get_my_current_game_query.query';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { SendAnswerInputDto } from '../../questions/api/input-dto/question.input-dto';
import { SendAnswerCommand } from '../application/commands/send_answer.use-case';
import { GetAnswerQuery } from '../application/query/get_answer.query';
import { GetStatisticQuery } from '../application/query/get_statistic.query';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetMyGamesQuery } from '../application/query/get_my_games.query';
import {
  GetGamesQueryParams,
  GetTopQueryParams,
} from './input-dto/game_query_params';
import { GetTopPlayersQuery } from '../application/query/get_top.query';
import {
  GamesStatisticViewDto,
  TopPlayersViewDto,
} from './view-dto/game_statistic.view-dto';
import { GameSwagger } from '../swagger/game.swagger';

@Controller('pair-game-quiz')
export class GameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('pairs/my-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.GetMyCurrentGame()
  async getGame(
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(
      new GetMyCurrentGameQuery(Number(user.currentUserId)),
    );
  }

  @Get('users/my-statistic')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.GetMyStatistic()
  async getStatistic(
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GamesStatisticViewDto> {
    return this.queryBus.execute(
      new GetStatisticQuery(Number(user.currentUserId)),
    );
  }

  @Get('users/top')
  @HttpCode(HttpStatus.OK)
  @GameSwagger.GetTopPlayers()
  async getTop(
    @Query() query: GetTopQueryParams,
  ): Promise<PaginatedViewDto<TopPlayersViewDto[]>> {
    return this.queryBus.execute(new GetTopPlayersQuery(query));
  }

  @Get('pairs/my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.GetMyGames()
  async getAllMyGames(
    @Query() query: GetGamesQueryParams,
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<GameViewDto[]>> {
    return this.queryBus.execute(
      new GetMyGamesQuery(Number(user.currentUserId), query),
    );
  }

  @Get('pairs/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.GetGameById()
  async getGameById(
    @Param('id', ObjectIdValidationPipe) id: number,
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(
      new GetGameByIdQuery(id, Number(user.currentUserId)),
    );
  }

  @Post('pairs/connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.StartGame()
  async startGame(
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    const gameId: number = await this.commandBus.execute(
      new ConnectGameCommand(Number(user.currentUserId)),
    );
    return this.queryBus.execute(
      new GetGameByIdQuery(gameId, Number(user.currentUserId)),
    );
  }

  @Post('pairs/my-current/answers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @GameSwagger.SendAnswer()
  async sendAnswer(
    @Body() body: SendAnswerInputDto,
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<AnswerResultViewDto> {
    const result: { answerId: number; gameId: number } =
      await this.commandBus.execute(
        new SendAnswerCommand(Number(user.currentUserId), body.answer),
      );
    return this.queryBus.execute(
      new GetAnswerQuery(
        Number(user.currentUserId),
        result.gameId,
        result.answerId,
      ),
    );
  }
}
