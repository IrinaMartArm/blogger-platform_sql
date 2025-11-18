import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts-query.repository';
import { PostsQueryParams } from '../../api/input-dto/posts.input-dto';

export class GetPostsQuery {
  constructor(
    public readonly query: PostsQueryParams,
    public readonly userId?: number,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async execute({ query, userId }: GetPostsQuery) {
    return this.postsQueryRepository.getPosts(query, userId);
  }
}
