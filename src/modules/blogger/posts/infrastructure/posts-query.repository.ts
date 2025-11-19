import { Injectable } from '@nestjs/common';
import { NewestLikes, PostViewDto } from '../api/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {
  PostsQueryParams,
  PostsSortBy,
} from '../api/input-dto/posts.input-dto';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entity/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export interface PostsWithLikes extends Post {
  blog_name: string;
  likes_count: string;
  dislikes_count: string;
  total_count: string;
  my_status: string;
  newest_likes: NewestLikes[];
}

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findPost(postId: number, userId?: number): Promise<PostViewDto> {
    const posts: PostsWithLikes[] = await this.dataSource.query(
      `
    WITH post_likes_aggregated AS (
      SELECT 
        pl.post_id,
        COUNT(*) FILTER (WHERE pl.status = 'Like') AS likes_count,
        COUNT(*) FILTER (WHERE pl.status = 'Dislike') AS dislikes_count,
        COALESCE((
          SELECT status 
          FROM post_likes pl2 
          WHERE pl2.post_id = pl.post_id AND pl2.user_id = $2
        ), 'None') AS my_status,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'addedAt', pl3.added_at,
              'userId', pl3.user_id::text,
              'login', u.login
            )
                 ORDER BY pl3.added_at DESC  -- ГАРАНТИЯ ПОРЯДКА!
          )
          FROM (
            SELECT added_at, user_id
            FROM post_likes 
            WHERE post_id = pl.post_id AND status = 'Like'
            ORDER BY added_at DESC
            LIMIT 3
          ) pl3
          JOIN users u ON u.id = pl3.user_id
        ), '[]'::json) AS newest_likes
      FROM post_likes pl
      WHERE pl.post_id = $1
      GROUP BY pl.post_id
    )
    
    SELECT 
      p.*,
      b.name AS blog_name,
      COALESCE(pla.likes_count, 0) AS likes_count,
      COALESCE(pla.dislikes_count, 0) AS dislikes_count,
      COALESCE(pla.my_status, 'None') AS my_status,
      COALESCE(pla.newest_likes, '[]'::json) AS newest_likes
    FROM posts p
    JOIN blogs b ON p.blog_id = b.id
    LEFT JOIN post_likes_aggregated pla ON pla.post_id = p.id
    WHERE p.id = $1 AND p.deleted_at IS NULL
    LIMIT 1
    `,
      [postId, userId || null],
    );

    if (posts.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToView(posts[0]);
  }

  private getSearchField(sortBy?: PostsSortBy): string {
    const fieldMap: Record<PostsSortBy, string> = {
      [PostsSortBy.CreatedAt]: 'createdAt',
      [PostsSortBy.Title]: 'title',
      [PostsSortBy.ShortDescription]: 'shortDescription',
      [PostsSortBy.Content]: 'content',
      [PostsSortBy.BlogName]: 'blogName',
    };
    return fieldMap[sortBy as PostsSortBy] ?? 'createdAt';
  }

  async getPosts(query: PostsQueryParams, userId?: number, blogId?: number) {
    const { sortDirection, sortBy, pageNumber, pageSize } = query;
    const skip = (pageNumber - 1) * pageSize;
    const dir = sortDirection === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.postsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('posts.blog', 'b')
      .where('p.deletedAt IS NULL');

    if (blogId) {
      qb.andWhere('p.blogId = :blogId', { blogId });
    }

    qb.loadRelationCountAndMap('post.likesCount', 'post.likes', 'like', (qb) =>
      qb.where('like.status = :status', { status: 'Like' }),
    );

    qb.loadRelationCountAndMap(
      'post.dislikesCount',
      'post.likes',
      'like',
      (qb) => qb.where('like.status = :status', { status: 'Dislike' }),
    );

    qb.loadRelationCountAndMap('post.myStatus', 'post.likes', 'like', (qb) =>
      qb.where('like.userId = :userId', { userId: userId ?? -1 }),
    )
      .addSelect((subQb) => {
        return subQb
          .select('COALESCE(myLike.status, :none)', 'myStatus')
          .from('post-likes', 'pl')
          .where('pl.postId = post.id')
          .andWhere('pl.userId = :userId', { userId: userId ?? -1 })
          .limit(1);
      }, 'myStatus')
      .setParameter('none', 'None');

    qb.leftJoinAndMapMany(
      'post.newsLikes',
      'post.likes',
      'newsLikes',
      'newsLikes.status = :status',
      { status: 'Like' },
    )
      .addSelect(['newestLike.addedAt', 'newestLike.userId'])
      .leftJoinAndSelect('newestLike.user', 'likedUser')
      .addOrderBy('newestLike.addedAt', 'DESC')
      .take(3);

    const sortField = this.getSearchField(sortBy);
    qb.orderBy(`p.${sortField}`, dir);
    qb.addOrderBy('p.id', dir);
    qb.skip(skip);
    qb.take(pageNumber);

    const [posts, totalCount] = await qb.getManyAndCount();
    return { posts, totalCount };
  }
}
