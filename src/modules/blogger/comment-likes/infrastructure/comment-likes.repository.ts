import { Injectable } from '@nestjs/common';
import { CommentLike } from '../entity/comment-like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentLikeRepo: Repository<CommentLike>,
  ) {}

  async save(like: CommentLike): Promise<void> {
    await this.commentLikeRepo.save(like);
  }

  async findLike(userId: number, commentId: number) {
    const result = await this.commentLikeRepo.findOneBy({
      userId,
      commentId,
    });
    return result || null;
  }

  async delete(userId: number, commentId: number): Promise<void> {
    await this.commentLikeRepo.delete({
      userId,
      commentId,
    });
  }
}
