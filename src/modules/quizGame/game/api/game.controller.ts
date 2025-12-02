import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/jwt-auth.guard';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { GameViewDto } from './view-dto/game.view-dto';
import { GetGameByIdQuery } from '../application/query/get_game_by_id.use-case';
import { ConnectGameCommand } from '../application/commands/connect_game.use-case';
import { GetMyCurrentGameQuery } from '../application/query/get_my_current_game_query.use-case';

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

  @Post('connection')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async startGame(
    @GetUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    const gameId: number = await this.commandBus.execute(
      new ConnectGameCommand(Number(user.currentUserId)),
    );
    return this.queryBus.execute(new GetGameByIdQuery(gameId));
  }
}
