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
      userId: dto.userId.toString(),
      userLogin: dto.u_login,
    };
    comment.likesInfo = {
      likesCount: Number(dto.likesCount),
      dislikesCount: Number(dto.dislikesCount),
      myStatus: dto.myStatus,
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
