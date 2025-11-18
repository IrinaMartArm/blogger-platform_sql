import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreatePostByBlogIdInputDto } from '../api/input-dto/post.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UpdatePostInputDto } from '../../posts/api/input-dto/posts.input-dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogRepository: BlogsRepository,
    private postsService: PostsService,
  ) {}

  async deleteBlog(id: number) {
    await this.findBlogById(id);

    return this.blogRepository.deleteBlog(id);
  }

  async createPostForBlog(blogId: number, body: CreatePostByBlogIdInputDto) {
    await this.findBlogById(blogId);
    return this.postsService.createPost({ ...body }, blogId);
  }

  async updatePost(blogId: number, postId: number, body: UpdatePostInputDto) {
    await this.findBlogById(blogId);
    return this.postsService.updatePost(postId, body, blogId);
  }

  async deletePost(blogId: number, postId: number) {
    await this.findBlogById(blogId);
    return this.postsService.deletePost(postId, blogId);
  }

  private async findBlogById(blogId: number) {
    const blog = await this.blogRepository.findBlog(blogId);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No blog found',
      });
    }
  }
}
