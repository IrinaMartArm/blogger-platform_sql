import { Post } from '../../entity/post.entity';
import { PostsWithLikes } from '../../infrastructure/posts-query.repository';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostsWithLikes): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.short_description;
    dto.content = post.content;
    dto.blogId = post.blog_id.toString();
    dto.blogName = post.blog_name;
    dto.createdAt = post.created_at;
    dto.extendedLikesInfo = {
      likesCount: Number(post.likes_count),
      dislikesCount: Number(post.dislikes_count),
      myStatus: post.my_status,
      newestLikes: post.newest_likes,
    };

    return dto;
  }
}

export type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};

export type NewestLikesDb = {
  addedAt: Date;
  userId: string;
  login: string;
};

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLikes[];
}

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};

export type CommentViewDto = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};
