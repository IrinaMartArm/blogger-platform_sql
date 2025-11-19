import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';

export class GetBlogQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetBlogQuery)
export class GetBlogQueryHandler implements IQueryHandler<GetBlogQuery> {
  constructor(private readonly blogsQueryRepository: BlogsQueryRepository) {}

  async execute({ id }: GetBlogQuery) {
    const blog = await this.blogsQueryRepository.getBlogById(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No blog found.',
      });
    }

    return BlogViewDto.mapToView(blog);
  }
}
