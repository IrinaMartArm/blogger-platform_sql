import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/baseEntity';
import { Post } from '../../posts/entity/post.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'int', nullable: false })
  postId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false, length: 300 })
  content: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
