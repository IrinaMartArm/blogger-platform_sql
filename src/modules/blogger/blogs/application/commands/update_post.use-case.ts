import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostInputDto } from '../../../posts/api/input-dto/posts.input-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public readonly postId: number,
    public readonly dto: UpdatePostInputDto,
    public readonly id?: number,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ id, postId, dto }: UpdatePostCommand): Promise<void> {
    if (id) {
      const blog = await this.blogsRepository.findBlog(id);

      if (!blog) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: `Blog does not exist`,
        });
      }
    }

    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    post.updatePost(dto);
    await this.postsRepository.save(post);
  }
}
