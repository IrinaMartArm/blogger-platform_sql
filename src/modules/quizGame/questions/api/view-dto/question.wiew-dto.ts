import { Question } from '../../entity/question.entity';

export class QuestionsViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;

  static mapToView(question: Question) {
    const dto = new QuestionsViewDto();
    dto.id = question.id.toString();
    dto.body = question.body;
    dto.correctAnswers = Object.values(question.correctAnswers);
    dto.published = question.published;
    dto.createdAt = question.createdAt.toISOString();
    dto.updatedAt = question.updatedAt?.toISOString() ?? null;
    return dto;
  }
}
