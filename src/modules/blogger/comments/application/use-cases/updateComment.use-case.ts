import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateCommentCommand {
  constructor(
    public currentUserId: number,
    public commentId: number,
    public body: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute({ commentId, currentUserId, body }: UpdateCommentCommand) {
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
        message: 'You do not have permission to update comment',
      });
    }

    comment.update(body);
    await this.commentsRepository.save(comment);
  }
}
