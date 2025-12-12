import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum GamesSortBy {
  Id = 'id',
  Status = 'status',
  PairCreatedDate = 'pairCreatedDate',
}

export class GetGamesQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsEnum(GamesSortBy)
  sortBy?: GamesSortBy = GamesSortBy.PairCreatedDate;
}

export class GetTopQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return ['avgScores desc'];
    return Array.isArray(value) ? value : [value];
  })
  sort?: string[];
}
