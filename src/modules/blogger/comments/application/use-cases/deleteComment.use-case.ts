import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: number,
    public readonly currentUserId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentsUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({
    commentId,
    currentUserId,
  }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findComment(commentId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Could not find comment',
      });
    }

    if (comment.userId !== currentUserId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You do not have permission to delete a comment',
      });
    }
    await this.commentsRepository.deleteComment(commentId);
  }
}
