import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/posts-query.repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/comments.query-repository';
import { CommentLikesRepository } from './comment-likes/infrastructure/comment-likes.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { DeleteCommentsUseCase } from './comments/application/use-cases/deleteComment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/updateComment.use-case';
import { SetPostLikeStatusUseCase } from './post-likes/applications/use-cases/set-post-like.use-case';
import { PostLikesRepository } from './post-likes/infrastructure/post-likes.repository';
import { CreateCommentUseCase } from './posts/application/use-cases/createComment.use-case';
import { SetCommentLikeUseCase } from './comment-likes/application/use-cases/set-comment-like.use-case';
import { AdminPostsController } from './posts/api/admin.posts.controller';
import { AdminBlogsController } from './blogs/api/admin.blogs.controller';
import { GetCommentsQueryHandler } from './comments/application/query/get_comments.query';
import { GetPostQueryHandler } from './posts/application/query/get_post.query';
import { GetCommentQueryHandler } from './comments/application/query/get_comment.query';
import { GetPostsQueryHandler } from './posts/application/query/get_posts.query';
import { CreateBlogUseCase } from './blogs/application/commands/CreateBlogUseCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { UpdateBlogUseCase } from './blogs/application/commands/UpdateBlogUseCase';
import { DeleteBlogUseCase } from './blogs/application/commands/DeleteBlogUseCase';
import { DeletePostFromBlogUseCase } from './blogs/application/commands/DeletePostFromBlogUseCase';
import { UpdatePostFromBlogUseCase } from './blogs/application/commands/UpdatePostFromBlogUseCase';
import { CreatePostFromBlogUseCase } from './blogs/application/commands/CreatePostFromBlogUseCase';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostFromBlogUseCase,
  UpdatePostFromBlogUseCase,
  DeletePostFromBlogUseCase,
  DeleteCommentsUseCase,
  UpdateCommentUseCase,
  SetPostLikeStatusUseCase,
  CreateCommentUseCase,
  SetCommentLikeUseCase,
  UpdateCommentUseCase,
];

const query = [
  GetPostQueryHandler,
  GetPostsQueryHandler,
  GetCommentQueryHandler,
  GetCommentsQueryHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), UserAccountsModule],
  controllers: [
    AdminBlogsController,
    BlogsController,
    AdminPostsController,
    PostsController,
    CommentsController,
  ],
  providers: [
    BlogsService,
    PostsService,
    BlogsQueryRepository,
    PostsQueryRepository,
    PostLikesRepository,
    CommentsQueryRepository,
    CommentsRepository,
    CommentLikesRepository,
    BlogsRepository,
    PostsRepository,
    ...useCases,
    ...query,
  ],
})
export class BloggerModule {}
