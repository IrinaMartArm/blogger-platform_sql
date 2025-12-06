import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionsInputDto } from '../api/input-dto/question.input-dto';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 500 })
  body: string;

  @Column({ type: 'jsonb', nullable: false })
  correctAnswers: string[];

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  static create(dto: QuestionsInputDto): Question {
    const question = new Question();
    question.body = dto.body.trim();
    question.correctAnswers = dto.correctAnswers.map((a) => a.trim());
    question.updatedAt = null;
    return question;
  }

  update(dto: QuestionsInputDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers.map((a) => a.trim());
    // this.correctAnswers = dto.correctAnswers.reduce(
    //   (acc, answer, index) => {
    //     const key = String.fromCharCode(65 + index); // A, B, C, D...
    //     acc[key] = answer.trim();
    //     return acc;
    //   },
    //   {} as Record<string, string>,
    // );
  }

  changePublished(isPublished: boolean) {
    this.published = isPublished;
  }
}
