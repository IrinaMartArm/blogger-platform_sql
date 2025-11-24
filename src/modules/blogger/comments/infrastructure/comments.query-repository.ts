import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CommentsSortBy,
  GetCommentsQueryParams,
} from '../../posts/api/input-dto/get-comments-query-params.input-dto';
import { Comment } from '../entity/comment.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';
import { CommentLike } from '../../comment-likes/entity/comment-like.entity';

export interface CommentWithInfo extends Comment {
  u_login: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
}

export interface CommentsWithInfo extends CommentWithInfo {
  totalCount: number;
}

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getComments(
    postId: number,
    query: GetCommentsQueryParams,
    currentUserId?: number,
  ): Promise<CommentsWithInfo[]> {
    const { sortDirection, sortBy, pageNumber, pageSize } = query;
    const skip = (pageNumber - 1) * pageSize;
    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const sortFields = {
      [CommentsSortBy.CreatedAt]: 'c.createdAt',
      [CommentsSortBy.Content]: 'c.content',
    };

    const sortField = sortBy ? sortFields[sortBy] : 'c.createdAt';

    const qb = this.dataSource
      .createQueryBuilder()
      .from(Comment, 'c')
      .leftJoin(User, 'u', 'u.id = c.userId')
      .select([
        'c.*',
        'u.login',

        `(SELECT COUNT(*) 
        FROM comment_likes cl 
        WHERE cl."commentId" = c.id AND cl.status = 'Like')::int 
       AS "likesCount"`,

        `(SELECT COUNT(*) 
        FROM comment_likes cl 
        WHERE cl."commentId" = c.id AND cl.status = 'Dislike')::int
       AS "dislikesCount"`,

        `COALESCE(
        (SELECT cl.status 
         FROM comment_likes cl 
         WHERE cl."commentId" = c.id AND cl."userId" = :currentUserId 
         LIMIT 1),
        'None'
      ) AS "myStatus"`,

        `COUNT(*) OVER()::int AS "totalCount"`,
      ])
      .where('c.postId = :postId', { postId })
      .andWhere('c."deletedAt" IS NULL')
      .orderBy(sortField, dir)
      .addOrderBy('c.id', dir)
      .offset(skip)
      .limit(pageSize)
      .setParameter('currentUserId', currentUserId ?? -1);

    const result = await qb.getRawMany();
    return result as CommentsWithInfo[];
  }

  async getComments_(
    postId: number,
    query: GetCommentsQueryParams,
    currentUserId?: number,
  ): Promise<CommentsWithInfo[]> {
    const { sortDirection, sortBy, pageNumber, pageSize } = query;
    const skip = (pageNumber - 1) * pageSize;
    const dir = sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const sortFields = {
      [CommentsSortBy.CreatedAt]: 'c.createdAt',
      [CommentsSortBy.Content]: 'c.content',
    };

    const sortOrder = sortBy ? sortFields[sortBy] : 'c.createdAt';

    //📌 PARTITION BY c.id = «считай лайки отдельно по каждому комменту»
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'c.*',
        'u.login',
        `COUNT(*) OVER()::int as "totalCount"`,
        `COUNT(*) FILTER (WHERE cl.status = 'Like') OVER (PARTITION BY c.id) AS "likesCount"`,
        `COUNT(*) FILTER (WHERE cl.status = 'Dislike') OVER (PARTITION BY c.id) AS "dislikesCount"`,
        `COALESCE(MAX(CASE WHEN cl.userId = :currentUserId THEN cl.status END) OVER (PARTITION BY c.id), 'None') AS "myStatus"`,
      ])
      .from(Comment, 'c')
      .leftJoin(User, 'u', 'u.id = c.userId')
      .leftJoin(CommentLike, 'cl', 'cl.commentId = c.id')
      .where('c.deletedAt IS NULL')
      .andWhere('c.postId = :postId', { postId })
      .orderBy(sortOrder, dir)
      .addOrderBy('c.id', dir)
      .offset(skip)
      .limit(pageSize)
      .setParameter('currentUserId', currentUserId ?? null);

    const result = await qb.getRawMany();

    return result as CommentsWithInfo[];
  }

  async getComment(
    commentId: number,
    currentUserId?: number,
  ): Promise<CommentWithInfo | null> {
    const qb = this.dataSource
      .createQueryBuilder()
      .select([
        'c.*',
        'u.login',

        `(SELECT COUNT(*) 
        FROM comment_likes cl 
        WHERE cl."commentId" = c.id AND cl.status = 'Like'
      )::int AS "likesCount"`,

        `(SELECT COUNT(*) 
        FROM comment_likes cl 
        WHERE cl."commentId" = c.id AND cl.status = 'Dislike'
      )::int AS "dislikesCount"`,

        `COALESCE(
        (SELECT cl.status 
        FROM comment_likes cl 
        WHERE cl."commentId" = c.id 
          AND cl."userId" = :currentUserId
        LIMIT 1),
         'None'
      ) AS "myStatus"`,
      ])
      .from(Comment, 'c')
      .leftJoin(User, 'u', 'u.id = c.userId')
      .where('c.id = :commentId', { commentId })
      .andWhere('c."deletedAt" IS NULL')
      .setParameter('currentUserId', currentUserId ?? null);

    const result = (await qb.getRawOne()) as CommentWithInfo;

    return result ?? null;
  }

  async getComment_(
    commentId: number,
    currentUserId?: number,
  ): Promise<CommentWithInfo | null> {
    const qb = this.dataSource
      .createQueryBuilder(Comment, 'c')
      .leftJoin(User, 'u', 'u.id = c.userId')
      .leftJoin(CommentLike, 'cl', 'cl.commentId = c.id')
      .select([
        'c.*',
        'u.login',

        `COUNT(*) FILTER (WHERE cl.status = 'Like')::int as "likesCount"`,
        `COUNT(*) FILTER (WHERE cl.status = 'Dislike')::int as "dislikesCount"`,

        `COALESCE(MAX(CASE WHEN cl.userId = :currentUserId THEN cl.status END), 'None') as "myStatus"`,
      ])
      .where('c.id = :commentId', { commentId })
      .andWhere('c.deletedAt IS NULL')
      .groupBy('c.id')
      .addGroupBy('u.login')
      .setParameter('currentUserId', currentUserId ?? null);

    const result = (await qb.getRawOne()) as CommentWithInfo;

    return result ?? null;
  }
}
