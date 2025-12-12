import { IsStringWithTrim } from '../../../../../core/decorators/validation/isStringTrim';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionsInputDto {
  @ApiProperty({
    minLength: 10,
    maxLength: 500,
  })
  @IsStringWithTrim(10, 500)
  body: string;

  @ApiProperty({
    example: ['TypeScript'],
    type: [String],
    description: 'Список правильных ответов',
  })
  @IsArray() //массив обязателен
  @ArrayNotEmpty()
  @ArrayMinSize(1) //в массиве минимум 1 элемент
  @IsString({ each: true }) //каждый элемент — строка
  @Length(1, 100, { each: true }) //длина каждой строки — от 1 до 100 символов
  correctAnswers: string[];
}

export class PublishInputDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  published: boolean;
}

export class SendAnswerInputDto {
  @ApiProperty({
    maxLength: 50,
  })
  @IsStringWithTrim(1, 50)
  answer: string;
}
