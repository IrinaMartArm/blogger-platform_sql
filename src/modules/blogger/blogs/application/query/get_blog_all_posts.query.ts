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
    public readonly id: number,
    public readonly query: PostsQueryParams,
    public readonly currentUserId?: number,
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
    id,
    query,
    currentUserId,
  }: GetBlogAllPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageNumber, pageSize } = query;
    const blog = await this.blogsRepository.findBlog(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    const { posts, totalCount } = await this.postsQueryRepository.getPosts(
      query,
      currentUserId,
    );

    console.log('posts', posts);

    const items = posts.map((post) => PostViewDto.mapToView(post));

    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
