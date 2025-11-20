import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from '../../blogs/entity/blog.entity';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from '../api/input-dto/posts.input-dto';
import { BaseEntity } from '../../../../core/entities/baseEntity';
import { PostLike } from '../../post-likes/domain/post-likes.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 30, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ type: 'int', nullable: false })
  blogId: number;

  @OneToMany(() => PostLike, (like: PostLike) => like.post, {
    onDelete: 'CASCADE',
  })
  likes: PostLike[];

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @OneToMany(() => Comment, (c: Comment) => c.post, { onDelete: 'CASCADE' })
  comments: Comment[];

  static create(blogId: number, dto: CreatePostInputDto) {
    const post = new Post();
    post.title = dto.title;
    post.content = dto.content;
    post.shortDescription = dto.shortDescription;
    post.blogId = blogId;

    return post;
  }

  updatePost(dto: UpdatePostInputDto) {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
  }
}
