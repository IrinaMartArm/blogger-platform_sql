import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostFromBlogCommand {
  constructor(
    public readonly id: number,
    public readonly postId: number,
  ) {}
}

@CommandHandler(DeletePostFromBlogCommand)
export class DeletePostFromBlogUseCase
  implements ICommandHandler<DeletePostFromBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute({ id, postId }: DeletePostFromBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlog(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No blog found',
      });
    }
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No post found',
      });
    }
    return this.postsRepository.deletePost(postId);
  }
}
