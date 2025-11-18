import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from '../api/input-dto/posts.input-dto';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ type: 'int', nullable: false })
  blogId: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

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
