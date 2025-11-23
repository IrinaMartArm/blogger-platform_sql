import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/baseEntity';
import { Post } from '../../posts/entity/post.entity';
import { User } from '../../../user-accounts/user/entity/user.entity';
import { CreateCommentInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { CommentLike } from '../../comment-likes/entity/comment-like.entity';

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

  @OneToMany(() => CommentLike, (like) => like.comment, { onDelete: 'CASCADE' })
  likes: CommentLike[];

  static create(userId: number, postId: number, dto: CreateCommentInputDto) {
    const comment = new Comment();
    comment.content = dto.content;
    comment.userId = userId;
    comment.postId = postId;

    return comment;
  }

  update(content: string) {
    this.content = content;
  }
}
