import { CommentWithInfo } from '../../infrastructure/comments.query-repository';

export class CommentsViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
  static mapToView(dto: CommentWithInfo): CommentsViewDto {
    const comment = new CommentsViewDto();
    comment.id = dto.id.toString();
    comment.content = dto.content;
    comment.createdAt = dto.createdAt.toISOString();
    comment.commentatorInfo = {
      userId: dto.user_id.toString(),
      userLogin: dto.login,
    };
    comment.likesInfo = {
      likesCount: Number(dto.likes_count),
      dislikesCount: Number(dto.dislikes_count),
      myStatus: dto.my_status,
    };
    return comment;
  }
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

export type LikesInfoWithCommentId = {
  commentId: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};
