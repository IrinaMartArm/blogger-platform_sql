import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixBlogNameDefault1763715109196 implements MigrationInterface {
  name = 'FixBlogNameDefault1763715109196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blogs" ALTER COLUMN "name" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "blogs" ALTER COLUMN "name" SET DEFAULT ''
    `);
  }
}
