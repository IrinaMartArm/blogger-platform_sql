import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AnswerInputDto,
  QuestionsInputDto,
} from '../api/input-dto/question.input-dto';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 500 })
  body: string;

  @Column({ type: 'jsonb', nullable: false })
  correctAnswers: Record<string, string>;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  static create(dto: QuestionsInputDto): Question {
    const question = new Question();
    question.body = dto.body.trim();
    question.correctAnswers = dto.correctAnswers.reduce(
      (acc, answer, index) => {
        const key = String.fromCharCode(65 + index); // A, B, C, D...
        acc[key] = answer.trim();
        return acc;
      },
      {} as Record<string, string>,
    );
    return question;
  }

  update(dto: QuestionsInputDto) {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers.reduce(
      (acc, answer, index) => {
        const key = String.fromCharCode(65 + index); // A, B, C, D...
        acc[key] = answer.trim();
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  changePublished(isPublished: boolean) {
    this.published = isPublished;
  }

  checkAnswers(dto: AnswerInputDto) {}
}
