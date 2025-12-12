import { Question } from '../../entity/question.entity';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionsViewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  correctAnswers: string[];

  @ApiProperty()
  published: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
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
