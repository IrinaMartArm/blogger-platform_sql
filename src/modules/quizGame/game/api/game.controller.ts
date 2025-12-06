import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
  Param,
  Body,
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

@Controller('pair-game-quiz/pairs')
export class GameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('my-current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getGame(
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(
      new GetMyCurrentGameQuery(Number(user.currentUserId)),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getGameById(
    @Param('id', ObjectIdValidationPipe) id: number,
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.queryBus.execute(
      new GetGameByIdQuery(id, Number(user.currentUserId)),
    );
  }

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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

  @Post('my-current/answers')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async sendAnswer(
    @Body() body: SendAnswerInputDto,
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<AnswerResultViewDto> {
    const result: { answerId: number } = await this.commandBus.execute(
      new SendAnswerCommand(Number(user.currentUserId), body.answer),
    );
    return this.queryBus.execute(
      new GetAnswerQuery(Number(user.currentUserId), result.answerId),
    );
  }

  @Get('my-statistic')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getStatistic(@GetUserFromRequest() user: UserContextDto): Promise<any> {
    return this.queryBus.execute(
      new GetStatisticQuery(Number(user.currentUserId)),
    );
  }
}
