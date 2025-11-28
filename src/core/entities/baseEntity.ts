import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  public createdAt: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  public deletedAt: Date | null;
}
