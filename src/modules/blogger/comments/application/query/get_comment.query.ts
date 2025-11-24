import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { CommentsViewDto } from '../../api/view-dto/comments.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class GetCommentQuery {
  constructor(
    public commentId: number,
    public currentUserId?: number,
  ) {}
}

@QueryHandler(GetCommentQuery)
export class GetCommentQueryHandler implements IQueryHandler<GetCommentQuery> {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}
  async execute({ commentId, currentUserId }: GetCommentQuery) {
    console.log(commentId, currentUserId);
    const comment = await this.commentsQueryRepository.getComment(
      commentId,
      currentUserId,
    );
    console.log('comment', comment);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }
    return CommentsViewDto.mapToView(comment);
  }
}
