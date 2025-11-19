import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../entity/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog) private blogRepo: Repository<Blog>) {}

  async save(blog: Blog): Promise<number> {
    const result = await this.blogRepo.save(blog);
    return result.id;
  }

  async findBlog(id: number): Promise<Blog | null> {
    return this.blogRepo.findOneBy({ id });
  }

  async deleteBlog(id: number): Promise<void> {
    await this.blogRepo.softDelete(id);
  }
}
