import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateBlogCommand {
  constructor(
    public readonly id: number,
    public readonly dto: UpdateBlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ dto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlog(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'BLOG does not exist',
      });
    }
    blog.update(dto);
    await this.blogsRepository.save(blog);
  }
}
