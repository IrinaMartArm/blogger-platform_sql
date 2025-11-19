import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryParams {
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  public readonly pageNumber: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  public readonly pageSize: number = 10;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? value.toUpperCase() : 'ASC'))
  @IsIn(['ASC', 'DESC'])
  public readonly sortDirection?: 'ASC' | 'DESC' = 'DESC';
}
