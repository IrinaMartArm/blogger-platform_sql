import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  public createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  public deletedAt: Date | null;
}
