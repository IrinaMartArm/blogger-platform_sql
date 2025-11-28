import { LikeStatusValue } from '../dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/entity/post.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';

@Entity('post_likes')
@Index(['postId', 'status'])
@Index(['postId', 'userId'], { unique: true })
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  postId: number;

  @Column({ type: 'enum', enum: LikeStatusValue, nullable: false })
  status: LikeStatusValue;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'postId' })
  post: Post;

  static create(
    userId: number,
    postId: number,
    status: LikeStatusValue,
  ): PostLike {
    const like = new PostLike();
    like.userId = userId;
    like.postId = postId;
    like.status = status;

    return like;
  }

  update(status: LikeStatusValue) {
    this.status = status;
  }
}
