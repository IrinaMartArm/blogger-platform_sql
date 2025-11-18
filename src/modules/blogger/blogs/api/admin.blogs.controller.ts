import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from './input-dto/blogs.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import {
  CreatePostInputDto,
  PostsQueryParams,
  UpdatePostInputDto,
} from '../../posts/api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts-query.repository';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../../core/pipes/objectId-validation.pipe';
import { GetUserFromRequest } from '../../../user-accounts/decorators/param/getUserFromRequest';
import { UserContextDto } from '../../../user-accounts/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/commands/CreateBlogUseCase';
import { UpdateBlogCommand } from '../application/commands/UpdateBlogUseCase';
import { DeleteBlogCommand } from '../application/commands/DeleteBlogUseCase';
import { DeletePostFromBlogCommand } from '../application/commands/DeletePostFromBlogUseCase';
import { UpdatePostFromBlogCommand } from '../application/commands/UpdatePostFromBlogUseCase';
import { CreatePostFromBlogCommand } from '../application/commands/CreatePostFromBlogUseCase';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class AdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId: number = await this.commandBus.execute(
      new CreateBlogCommand(body),
    );
    return this.blogsQueryRepository.getBlogById(blogId);
  }

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getBlogs(query);
  }

  @Get('/:id')
  async getBlog(
    @Param('id', ObjectIdValidationPipe) id: number,
  ): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getBlogById(id);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ObjectIdValidationPipe) id: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Get('/:id/posts')
  // @UseGuards(OptionalJwtAuthGuard)
  async getPosts(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Query() query: PostsQueryParams,
    @GetUserFromRequest() user?: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const currentUserId = user && Number(user.currentUserId);
    return this.blogsQueryRepository.getPosts(id, query, currentUserId);
  }

  @Post('/:id/posts')
  async createPostForBlog(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Body() body: CreatePostInputDto,
  ): Promise<PostViewDto> {
    const postId: number = await this.commandBus.execute(
      new CreatePostFromBlogCommand(id, body),
    );
    return this.postsQueryRepository.findPost(postId, id);
  }

  @Put('/:id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Param('postId', ObjectIdValidationPipe) postId: number,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostFromBlogCommand(id, postId, body),
    );
  }

  @Delete('/:id/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ObjectIdValidationPipe) id: number,
    @Param('postId', ObjectIdValidationPipe) postId: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostFromBlogCommand(id, postId));
  }
}
