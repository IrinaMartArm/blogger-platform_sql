import { LikeStatusValue } from '../../dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLike } from '../../domain/post-likes.entity';

export class SetPostLikeStatusCommand {
  constructor(
    public postId: number,
    public userId: number,
    public status: LikeStatusValue,
  ) {}
}

@CommandHandler(SetPostLikeStatusCommand)
export class SetPostLikeStatusUseCase
  implements ICommandHandler<SetPostLikeStatusCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}
  async execute({ postId, status, userId }: SetPostLikeStatusCommand) {
    const repo = this.postLikesRepository;
    const post = await this.postsRepository.findPost(postId);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found.',
      });
    }

    const like = await repo.findLike(userId, postId);
    if (like) {
      if (status === LikeStatusValue.None) {
        await repo.deleteLike(userId, postId);
      } else {
        like.update(status);
        await repo.save(like);
      }
    } else if (status !== LikeStatusValue.None) {
      const like = PostLike.create(userId, postId, status);
      await repo.save(like);
    }
  }
}
