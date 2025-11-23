import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export class GetCommentsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(CommentsSortBy)
  sortBy?: CommentsSortBy = CommentsSortBy.CreatedAt;
}
