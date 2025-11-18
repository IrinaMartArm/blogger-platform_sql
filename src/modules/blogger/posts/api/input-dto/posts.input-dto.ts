import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/isStringTrim';
import { IsEnum, IsOptional } from 'class-validator';

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogName = 'blogName',
}

export class CreatePostInputDto {
  @IsStringWithTrim(1, 30)
  title: string;

  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsStringWithTrim(1, 1000)
  content: string;
}

export class UpdatePostInputDto extends CreatePostInputDto {}

export class PostsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(PostsSortBy)
  sortBy?: PostsSortBy = PostsSortBy.CreatedAt;
}

export class CreateCommentInputDto {
  @IsStringWithTrim(20, 300)
  content: string;
}

export class UpdateCommentInputDto extends CreateCommentInputDto {}
