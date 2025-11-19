import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from '../api/input-dto/posts.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Post } from '../entity/post.entity';

@Injectable()
export class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostInputDto, blogId: number): Promise<number> {
    const blog = await this.blogsRepository.findBlog(blogId);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    const post = Post.create(blogId, dto);
    await this.postsRepository.save(post);
    return post.id;
  }

  async updatePost(postId: number, body: UpdatePostInputDto): Promise<void> {
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    post.updatePost(body);
    await this.postsRepository.save(post);
  }

  async deletePost(postId: number): Promise<void> {
    const post = await this.postsRepository.findPost(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return this.postsRepository.deletePost(postId);
  }
}
