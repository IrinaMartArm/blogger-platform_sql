import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';
import { Blog } from '../domain/blog.entity';
import {
  BlogsSortBy,
  GetBlogsQueryParams,
} from '../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts-query.repository';
import { PostsQueryParams } from '../../posts/api/input-dto/posts.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface BlogWithCount extends Blog {
  total_count: string;
}

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async getBlogById(id: number): Promise<BlogViewDto> {
    const result: Blog[] = await this.dataSource.query(
      `
    SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [id],
    );

    const blog = result[0];

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No blog found.',
      });
    }

    return BlogViewDto.mapToView(blog);
  }

  async getBlogs(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } =
      query;
    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = (pageNumber - 1) * pageSize;
    const params: any[] = [];
    let paramIndex = 1;

    const filter = ['deleted_at IS NULL'];

    if (query.searchNameTerm) {
      filter.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${searchNameTerm}%`);
    }

    const sortFieldMap: Record<BlogsSortBy, string> = {
      [BlogsSortBy.CreatedAt]: 'created_at',
      [BlogsSortBy.Name]: 'name',
      [BlogsSortBy.Description]: 'description',
      [BlogsSortBy.WebsiteUrl]: 'website_url',
      [BlogsSortBy.IsMembership]: 'is_membership',
    };
    const validSortBy = sortBy ? sortFieldMap[sortBy] : 'created_at';
    const orderByClause = `${validSortBy} ${dir}, id ${dir}`;

    params.push(pageSize, skip);

    const sql = `SELECT b.*,
                COUNT(*) OVER() AS total_count
                FROM blogs b
                WHERE ${filter.join(' AND ')} 
                ORDER BY ${orderByClause} 
                LIMIT $${paramIndex++}
                OFFSET $${paramIndex++}`;

    const blogs: BlogWithCount[] = await this.dataSource.query(sql, params);

    const items = blogs.map((blog) => BlogViewDto.mapToView(blog));
    const totalCount = blogs.length > 0 ? Number(blogs[0].total_count) : 0;

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async getPosts(
    blogId: number,
    query: PostsQueryParams,
    currentUserId?: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getPosts(query, currentUserId, blogId);
  }
}
