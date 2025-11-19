import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/post-likes.entity';
import { LikeStatusValue } from '../dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(@InjectDataSource() private datasource: DataSource) {}
  async createLike(
    userId: number,
    postId: number,
    status: LikeStatusValue,
  ): Promise<void> {
    await this.datasource.query(
      `
        INSERT INTO post_likes (user_id, post_id, status) 
        VALUES ($1, $2, $3)`,
      [userId, postId, status],
    );
  }

  async findLike(userId: number, postId: number): Promise<PostLike | null> {
    const [result]: PostLike[] = await this.datasource.query(
      `
          SELECT * FROM post_likes
          WHERE user_id = $1 AND post_id = $2
          LIMIT 1`,
      [userId, postId],
    );
    return result || null;
  }

  async updateStatus(
    userId: number,
    postId: number,
    status: LikeStatusValue,
  ): Promise<void> {
    await this.datasource.query(
      `
        UPDATE post_likes
        SET status = $3 
        WHERE user_id = $1 AND post_id = $2`,
      [userId, postId, status],
    );
  }

  async deleteLike(userId: number, postId: number): Promise<void> {
    await this.datasource.query(
      `
    DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );
  }
}
