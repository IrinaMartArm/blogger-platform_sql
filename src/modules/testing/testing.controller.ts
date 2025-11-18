import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly datasource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const entities = this.datasource.entityMetadatas;

    for (const entity of entities) {
      await this.datasource.query(
        `TRUNCATE TABLE "${entity.tableName}" CASCADE;`,
      );
    }

    return { status: 'succeeded' };
  }
}
