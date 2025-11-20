import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/jwt-auth.guard';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { LikeInputDto } from '../../post-likes/dto';
import { SetPostLikeStatusCommand } from '../../post-likes/applications/use-cases/set-post-like.use-case';
import { CreateCommentCommand } from '../application/use-cases/create_comment.use-case';
import { GetCommentsQuery } from '../../comments/application/query/get_comments.query';
import { CommentViewDto, PostViewDto } from './view-dto/post.view-dto';
import {
  CreateCommentInputDto,
  PostsQueryParams,
  UpdatePostInputDto,
} from './input-dto/posts.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';
import { UpdateCommentCommand } from '../application/use-cases/update_comment.use-case';
import { GetCommentQuery } from '../../comments/application/query/get_comment.query';
import { GetPostQuery } from '../application/query/get_post.query';
import { OptionalJwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/optional-jwt-auth.guard';
import { GetBlogAllPostsQuery } from '../../blogs/application/query/get_blog_all_posts.query';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: number,
    @GetUserFromRequest() user?: UserContextDto,
  ): Promise<PostViewDto> {
    const userId = user && Number(user.currentUserId);
    return this.queryBus.execute(new GetPostQuery(id, userId));
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getPosts(
    @Query() query: PostsQueryParams,
    @GetUserFromRequest() user?: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const userId = user && Number(user.currentUserId);
    return this.queryBus.execute(new GetBlogAllPostsQuery(query, userId));
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() post: UpdatePostInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateCommentCommand(id, post));
  }

  @Get('/:id/comments')
  @UseGuards(OptionalJwtAuthGuard)
  async getPostComments(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Query() query: GetCommentsQueryParams,
    @GetUserFromRequest() user?: UserContextDto,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const userId = user && Number(user.currentUserId);
    return this.queryBus.execute(new GetCommentsQuery(id, query, userId));
  }

  @Post('/:id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @GetUserFromRequest() user: UserContextDto,
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() body: CreateCommentInputDto,
  ): Promise<CommentViewDto> {
    const commentId: number = await this.commandBus.execute(
      new CreateCommentCommand(body, id, Number(user.currentUserId)),
    );
    return this.queryBus.execute(
      new GetCommentQuery(commentId, Number(user.currentUserId)),
    );
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
