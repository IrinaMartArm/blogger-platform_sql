import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatusValue } from '../../../post-likes/dto';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentLike } from '../../entity/comment-like.entity';

export class SetCommentLikeCommand {
  constructor(
    public readonly commentId: number,
    public readonly userId: number,
    public status: LikeStatusValue,
  ) {}
}

@CommandHandler(SetCommentLikeCommand)
export class SetCommentLikeUseCase
  implements ICommandHandler<SetCommentLikeCommand>
{
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute({
    status,
    commentId,
    userId,
  }: SetCommentLikeCommand): Promise<void> {
    const repo = this.commentLikesRepository;
    const comment = await this.commentsRepository.findComment(commentId);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found.',
      });
    }

    const like = await repo.findLike(userId, commentId);

    if (like) {
      if (status === LikeStatusValue.None) {
        await repo.delete(userId, commentId);
      } else {
        like.update(status);
        await repo.save(like);
      }
    } else {
      const like = CommentLike.create(userId, commentId, status);
      await repo.save(like);
    }
  }
}
