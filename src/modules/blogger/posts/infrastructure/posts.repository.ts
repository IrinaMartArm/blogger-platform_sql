import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entity/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepository: Repository<Post>,
  ) {}

  async save(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async findPost(id: number): Promise<Post | null> {
    return await this.postsRepository.findOneBy({ id });
  }

  async deletePost(id: number): Promise<void> {
    await this.postsRepository.softDelete(id);
  }
}
