import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryParams } from './input-dto/posts.input-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PostsQueryRepository } from '../infrastructure/posts-query.repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/bearer/jwt-auth.guard';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { LikeInputDto } from '../../post-likes/dto';
import { SetPostLikeStatusCommand } from '../../post-likes/applications/use-cases/set-post-like.use-case';

@Controller('sa/posts')
export class AdminPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // async createPost(@Body() post: CreatePostInputDto): Promise<PostViewDto> {
  //   const postId = await this.postsService.createPost(post);
  //   return this.postsQueryRepository.findPost(postId);
  // }
  //
  @Get('/:id')
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: number,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.findPost(id);
  }

  @Get()
  async getPosts(
    @Query() query: PostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getPosts(query);
  }

  // @Put('/:id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updatePost(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Body() post: UpdatePostInputDto,
  // ): Promise<void> {
  //   return this.postsService.updatePost(id, post);
  // }
  //
  // @Delete('/:id')
  // @UseGuards(BasicAuthGuard)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deletePost(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   return this.postsService.deletePost(id);
  // }
  //
  // @Get('/:id/comments')
  // @UseGuards(OptionalJwtAuthGuard)
  // async getPostComments(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Query() query: GetCommentsQueryParams,
  //   @GetUserFromRequest() user?: UserContextDto,
  // ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
  //   return this.postsQueryRepository.getComments(
  //     id,
  //     query,
  //     user?.currentUserId,
  //   );
  // }

  // @Post('/:id/comments')
  // @UseGuards(JwtAuthGuard)
  // async createCommentForPost(
  //   @GetUserFromRequest() user: UserContextDto,
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Body() body: CreateCommentInputDto,
  // ): Promise<CommentViewDto> {
  //   const commentId: Types.ObjectId = await this.commandBus.execute(
  //     new CreateCommentCommand(body, id, user.currentUserId),
  //   );
  //
  //   return this.commentsQueryRepository.getComment(
  //     commentId,
  //     user.currentUserId,
  //   );
  // }

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
