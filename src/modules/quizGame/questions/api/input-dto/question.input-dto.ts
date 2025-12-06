import { IsStringWithTrim } from '../../../../../core/decorators/validation/isStringTrim';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsString,
  Length,
} from 'class-validator';

export class QuestionsInputDto {
  @IsStringWithTrim(10, 500)
  body: string;

  @IsArray() //массив обязателен
  @ArrayNotEmpty()
  @ArrayMinSize(1) //в массиве минимум 1 элемент
  @IsString({ each: true }) //каждый элемент — строка
  @Length(1, 100, { each: true }) //длина каждой строки — от 1 до 100 символов
  correctAnswers: string[];
}

export class AnswerInputDto {
  @IsStringWithTrim(1, 100)
  answer: string;
}

export class PublishInputDto {
  @IsBoolean()
  published: boolean;
}

export class SendAnswerInputDto {
  @IsStringWithTrim(1, 50)
  answer: string;
}
