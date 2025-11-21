import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostViewDto } from './view-dto/post.view-dto';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/jwt-auth.guard';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { LikeInputDto } from '../../post-likes/dto';
import { SetPostLikeStatusCommand } from '../../post-likes/applications/use-cases/set-post-like.use-case';
import { GetPostQuery } from '../application/query/get_post.query';

@Controller('sa/posts')
export class AdminPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get('/:id')
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: number,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostQuery(id));
  }

  @Put(':id/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setPostLikeStatus(
    @Param('id', ObjectIdValidationPipe) id: number,
    @GetUserFromRequest() user: UserContextDto,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new SetPostLikeStatusCommand(
        id,
        Number(user.currentUserId),
        body.likeStatus,
      ),
    );
  }
}
