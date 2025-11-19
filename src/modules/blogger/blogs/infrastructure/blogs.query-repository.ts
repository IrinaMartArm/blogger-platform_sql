import { Injectable } from '@nestjs/common';
import { Blog } from '../entity/blog.entity';
import {
  BlogsSortBy,
  GetBlogsQueryParams,
} from '../api/input-dto/get-blogs-query-params.input-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
  ) {}

  async getBlogById(id: number): Promise<Blog | null> {
    return this.blogRepo
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .andWhere('b.deletedAt IS NULL')
      .getOne();
  }

  async getBlogs(
    query: GetBlogsQueryParams,
  ): Promise<{ blogs: Blog[]; totalCount: number }> {
    const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } =
      query;
    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = (pageNumber - 1) * pageSize;

    const qb = this.blogRepo.createQueryBuilder('b');

    qb.where('b.deletedAt IS NULL');

    if (query.searchNameTerm) {
      qb.andWhere('b.name ILIKE :search', { search: `%${searchNameTerm}%` });
    }

    qb.orderBy(`b.${this.getSortField(sortBy)}`, dir);
    qb.addOrderBy('b.id', dir);

    const [blogs, totalCount] = await qb
      .take(pageSize)
      .skip(skip)
      .getManyAndCount();

    return { blogs, totalCount };
  }

  private getSortField(sortBy?: string): string {
    const sortFieldMap: Record<BlogsSortBy, string> = {
      [BlogsSortBy.CreatedAt]: 'createdAt',
      [BlogsSortBy.Name]: 'name',
      [BlogsSortBy.Description]: 'description',
      [BlogsSortBy.WebsiteUrl]: 'websiteUrl',
      [BlogsSortBy.IsMembership]: 'isMembership',
    };
    return sortFieldMap[sortBy as BlogsSortBy] ?? 'createdAt';
  }
}
