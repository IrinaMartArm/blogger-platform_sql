import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Post } from '../../../posts/domain/post.entity';
import { CreatePostInputDto } from '../../../posts/api/input-dto/posts.input-dto';

export class CreatePostFromBlogCommand {
  constructor(
    public readonly id: number,
    public readonly dto: CreatePostInputDto,
  ) {}
}

@CommandHandler(CreatePostFromBlogCommand)
export class CreatePostFromBlogUseCase
  implements ICommandHandler<CreatePostFromBlogCommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({ id, dto }: CreatePostFromBlogCommand): Promise<number> {
    const blog = await this.blogsRepository.findBlog(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog does not exist',
      });
    }
    const post = Post.create(id, dto);
    await this.postsRepository.save(post);
    return post.id;
  }
}
