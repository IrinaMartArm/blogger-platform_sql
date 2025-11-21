import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../api/input-dto/posts.input-dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Comment } from '../../../comments/entity/comment.entity';

export class CreateCommentCommand {
  constructor(
    public readonly dto: CreateCommentInputDto,
    public readonly postId: number,
    public readonly currenUserId: number,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute({
    dto,
    postId,
    currenUserId,
  }: CreateCommentCommand): Promise<number> {
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
        extensions: [{ message: 'Post not found', field: 'postId' }],
      });
    }

    const comment = Comment.create(currenUserId, postId, dto);

    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
