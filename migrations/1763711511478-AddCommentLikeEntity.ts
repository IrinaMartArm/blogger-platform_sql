import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentLikeEntity1763711511478 implements MigrationInterface {
  name = 'AddCommentLikeEntity1763711511478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comment_likes" ("id" SERIAL NOT NULL, "userId" integer, "commentId" integer, "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD "name" character varying(15) COLLATE "C" NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`,
    );
    await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD "name" character varying COLLATE "C" NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "comment_likes"`);
  }
}
