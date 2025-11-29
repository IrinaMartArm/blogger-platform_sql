import { IsStringWithTrim } from '../../../../../core/decorators/validation/isStringTrim';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
  Length,
} from 'class-validator';

export class QuestionsInputDto {
  @IsStringWithTrim(10, 500)
  body: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: false })
  @Length(1, 100, { each: true })
  correctAnswers: string[];
}

export class AnswerInputDto {
  @IsStringWithTrim(1, 100)
  answer: string;
}
