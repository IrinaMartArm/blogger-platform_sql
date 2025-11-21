import { Injectable } from '@nestjs/common';
import {
  PostsQueryParams,
  PostsSortBy,
} from '../api/input-dto/posts.input-dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entity/post.entity';
import { PostWithLikes, RawPostRecord } from '../api/view-dto/post.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectRepository(Post) private postsRepo: Repository<Post>) {}

  async findPost(
    postId: number,
    userId?: number,
  ): Promise<{ post?: PostWithLikes; raw?: RawPostRecord }> {
    const qb = this.postsRepo
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .addSelect('b.name', 'blogName')
      .where('p.deletedAt IS NULL')
      .andWhere('p.id = :postId', { postId });

    qb.loadRelationCountAndMap('p.likesCount', 'p.likes', 'like', (qb) =>
      qb.where('like.status = :status', { status: 'Like' }),
    ); //маппит результат прямо в сущность (Post), а не в raw.

    qb.loadRelationCountAndMap('p.dislikesCount', 'p.likes', 'like', (qb) =>
      qb.where('like.status = :status', { status: 'Dislike' }),
    );

    //addSelect маппит результат в raw.
    qb.addSelect((qb) => {
      return qb
        .select('pl.status')
        .from('post_likes', 'pl')
        .where('pl.postId = p.id')
        .andWhere('pl.userId = :userId')
        .limit(1);
    }, 'myStatus').setParameter('userId', userId ?? -1); //для примера

    qb.addSelect(
      `COALESCE((
      SELECT json_agg(likes_info)
      FROM (
        SELECT 
          pl."userId"::text,
          u.login,
          pl."createdAt" as "addedAt"
        FROM post_likes pl
        LEFT JOIN users u ON u.id = pl."userId"
        WHERE pl."postId" = p.id 
          AND pl.status = 'Like'
        ORDER BY pl."createdAt" DESC, pl.id DESC
        LIMIT 3
      ) likes_info
    ), '[]'::json)`,
      'newestLikes',
    );

    const { entities, raw } = await qb.getRawAndEntities();

    return { raw: raw[0] as RawPostRecord, post: entities[0] as PostWithLikes };
  }

  private getSearchField(sortBy?: PostsSortBy): string {
    const fieldMap: Record<PostsSortBy, string> = {
      [PostsSortBy.CreatedAt]: 'p.createdAt',
      [PostsSortBy.Title]: 'p.title',
      [PostsSortBy.ShortDescription]: 'p.shortDescription',
      [PostsSortBy.Content]: 'p.content',
      [PostsSortBy.BlogName]: 'blogName',
    };
    return fieldMap[sortBy as PostsSortBy] ?? 'p.createdAt';
  }

  async getPosts(
    query: PostsQueryParams,
    userId?: number,
    blogId?: number,
  ): Promise<{
    typedRaw: RawPostRecord[];
    posts: PostWithLikes[];
    totalCount: number;
  }> {
    const { sortDirection, sortBy, pageNumber, pageSize } = query;
    const skip = (pageNumber - 1) * pageSize;
    const dir = sortDirection === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.postsRepo
      .createQueryBuilder('p')
      .leftJoin('p.blog', 'b')
      .addSelect('b.name')
      .addSelect('b.name', 'blogName')
      .where('p.deletedAt IS NULL');

    if (blogId) {
      qb.andWhere('p.blogId = :blogId', { blogId });
    }

    qb.loadRelationCountAndMap('p.likesCount', 'p.likes', 'like', (qb) =>
      qb.where('like.status = :likeStatus', { likeStatus: 'Like' }),
    );

    qb.loadRelationCountAndMap('p.dislikesCount', 'p.likes', 'dislike', (qb) =>
      qb.where('dislike.status = :dislikeStatus', { dislikeStatus: 'Dislike' }),
    );

    qb.addSelect(
      `COALESCE((
      SELECT pl.status 
      FROM post_likes pl 
      WHERE pl."postId" = p.id 
        AND pl."userId" = :userId
      LIMIT 1
    ), 'None')`,
      'myStatus',
    ).setParameter('userId', userId ?? -1);

    qb.addSelect(
      `COALESCE((
      SELECT json_agg(likes_info)
      FROM (
        SELECT 
          pl."userId"::text,
          u.login,
          pl."createdAt" as "addedAt"
        FROM post_likes pl
        LEFT JOIN users u ON u.id = pl."userId"
        WHERE pl."postId" = p.id 
          AND pl.status = 'Like'
        ORDER BY pl."createdAt" DESC, pl.id DESC
        LIMIT 3
      ) likes_info
    ), '[]'::json)`,
      'newestLikes',
    );

    if (sortBy === PostsSortBy.BlogName) {
      qb.orderBy('b.name', dir);
    } else {
      const sortField = this.getSearchField(sortBy);
      qb.orderBy(sortField, dir);
    }

    // const sortField = this.getSearchField(sortBy);
    // qb.orderBy(sortField, dir);
    qb.addOrderBy('p.id', dir);
    qb.skip(skip);
    qb.take(pageSize);

    const { entities, raw } = await qb.getRawAndEntities();
    const totalCount = await qb.getCount();

    return {
      typedRaw: raw as RawPostRecord[],
      posts: entities as PostWithLikes[],
      totalCount,
    };
  }
}
