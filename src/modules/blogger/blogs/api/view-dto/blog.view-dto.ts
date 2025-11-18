import { BlogWithCount } from '../../infrastructure/blogs.query-repository';
import { Blog } from '../../domain/blog.entity';

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogWithCount | Blog): BlogViewDto {
    const dto = new BlogViewDto();
    dto.id = blog.id.toString();
    dto.name = blog.name;
    dto.websiteUrl = blog.websiteUrl;
    dto.description = blog.description;
    dto.createdAt = blog.createdAt.toISOString();
    dto.isMembership = blog.isMembership;

    return dto;
  }
}
