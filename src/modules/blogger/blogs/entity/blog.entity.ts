import { Column, Entity, OneToMany } from 'typeorm';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from '../api/input-dto/blogs.input-dto';
import { Post } from '../../posts/entity/post.entity';
import { BaseEntity } from '../../../../core/entities/baseEntity';

@Entity('blogs')
export class Blog extends BaseEntity {
  @Column({ type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  websiteUrl: string;

  @Column()
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog, { onDelete: 'CASCADE' })
  posts: Post[];

  static create(dto: CreateBlogInputDto) {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog;
  }

  update(dto: UpdateBlogInputDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
