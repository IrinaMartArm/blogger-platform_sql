import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQueryParams } from '../../../posts/api/input-dto/get-comments-query-params.input-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/posts-query.repository';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentsViewDto } from '../../api/view-dto/comments.view-dto';

export class GetCommentsQuery {
  constructor(
    public postId: number,
    public query: GetCommentsQueryParams,
    public userId?: number,
  ) {}
}

@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler
  implements IQueryHandler<GetCommentsQuery>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute({
    postId,
    query,
    userId,
  }: GetCommentsQuery): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const { pageSize, pageNumber } = query;
    const { post } = await this.postsQueryRepository.findPost(postId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    console.log('postId', postId);
    const result = await this.commentsQueryRepository.getComments(
      postId,
      query,
      userId,
    );

    console.log('result', result);

    const items = result.map((comment) => CommentsViewDto.mapToView(comment));
    return PaginatedViewDto.mapToView({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount: result[0].totalCount,
    });
  }
}
