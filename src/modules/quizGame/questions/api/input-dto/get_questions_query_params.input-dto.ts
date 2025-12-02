import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PublishedSearch {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  Body = 'body',
}

export class GetQuestionsQueryParamsInputDto extends BaseQueryParams {
  @IsString()
  @IsOptional()
  sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  bodySearchTerm: string | null = null;

  @IsEnum(PublishedSearch)
  @IsOptional()
  publishedStatus: PublishedSearch = PublishedSearch.All;
}
