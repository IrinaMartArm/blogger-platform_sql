import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;

  @IsOptional()
  @IsEnum(BlogsSortBy)
  sortBy?: BlogsSortBy = BlogsSortBy.CreatedAt;
}
