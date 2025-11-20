import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryParams } from '../../../posts/api/input-dto/posts.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/api/view-dto/post.view-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts-query.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetBlogAllPostsQuery {
  constructor(
    public readonly query: PostsQueryParams,
    public readonly currentUserId?: number,
    public readonly blogId?: number,
  ) {}
}

@QueryHandler(GetBlogAllPostsQuery)
export class GetBlogAllPostsQueryHandler
  implements IQueryHandler<GetBlogAllPostsQuery>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute({
    query,
    currentUserId,
    blogId,
  }: GetBlogAllPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize } = query;

    if (blogId) {
      const blog = await this.blogsRepository.findBlog(blogId);
      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Blog not found',
        });
      }
    }

    const { posts, totalCount, typedRaw } =
      await this.postsQueryRepository.getPosts(query, currentUserId, blogId);

    const items: PostViewDto[] = posts.map((post, i) =>
      PostViewDto.mapToView(post, typedRaw[i]),
    );

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
