import { Post } from '../../entity/post.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostWithLikes, raw: RawPostRecord): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = raw.blogName;
    dto.createdAt = post.createdAt.toISOString();
    dto.extendedLikesInfo = {
      likesCount: Number(post.likesCount) || 0,
      dislikesCount: Number(post.dislikesCount) || 0,
      myStatus: raw.myStatus || 'None',
      newestLikes: raw.newestLikes ?? [],
    };

    return dto;
  }
}

export type PostWithLikes = Post & {
  likesCount: string;
  dislikesCount: string;
};

export type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};

export interface RawPostRecord {
  blogName: string;
  myStatus: 'Like' | 'Dislike' | 'None';
  newestLikes: NewestLikes[];
}

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
