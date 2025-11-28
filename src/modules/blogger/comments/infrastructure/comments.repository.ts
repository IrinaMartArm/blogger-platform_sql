import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entity/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  async save(comment: Comment): Promise<void> {
    await this.commentsRepo.save(comment);
  }

  async findComment(id: number): Promise<Comment | null> {
    return this.commentsRepo.findOneBy({ id });
  }

  async deleteComment(id: number): Promise<void> {
    await this.commentsRepo.softDelete(id);
  }
}
