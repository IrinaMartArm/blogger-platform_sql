import { LikeStatusValue } from '../../post-likes/dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from '../../comments/entity/comment.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';

@Entity('comment_likes')
@Index(['commentId', 'status'])
@Index(['commentId', 'userId'], { unique: true })
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  commentId: number;

  @Column({ type: 'enum', enum: LikeStatusValue, nullable: false })
  status: LikeStatusValue;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  static create(userId: number, commentId: number, status: LikeStatusValue) {
    const like = new CommentLike();
    like.userId = userId;
    like.commentId = commentId;
    like.status = status;

    return like;
  }

  update(status: LikeStatusValue) {
    this.status = status;
  }
}
