import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/post-likes.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
  ) {}

  async save(like: PostLike): Promise<void> {
    await this.postLikeRepository.save(like);
  }

  async findLike(userId: number, postId: number): Promise<PostLike | null> {
    return this.postLikeRepository.findOneBy({ userId, postId });
  }

  async deleteLike(userId: number, postId: number): Promise<void> {
    await this.postLikeRepository.delete({ userId, postId });
  }
}
