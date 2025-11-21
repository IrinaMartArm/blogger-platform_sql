import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/posts-query.repository';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../../core/exceptions/domain-exception';

export class GetPostQuery {
  constructor(
    public readonly postId: number,
    public readonly userId?: number,
  ) {}
}

@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async execute({ postId, userId }: GetPostQuery): Promise<PostViewDto> {
    const { post, raw } = await this.postsQueryRepository.findPost(
      postId,
      userId,
    );

    if (!post || !raw) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No post found',
      });
    }
    return PostViewDto.mapToView(post, raw);
  }
}
