import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1764240921253 implements MigrationInterface {
  name = 'AddIndexes1764240921253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comment_likes" DROP COLUMN "test2"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_204e9b624861ff4a5b26819210" ON "users" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a32f641edba1d0f973c19cc94" ON "users" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0a3e56b91a130ad59dabee524c" ON "blogs" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3afc08c4141be9001daef63f9a" ON "blogs" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f5a86465d43c2db24ea46f0644" ON "blogs" ("name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_30ee85070afe5b92b5920957b1" ON "post_likes" ("postId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7f7397812756766dca1ef7496" ON "post_likes" ("postId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3572e068a66569a0fb2f3ed7b" ON "comment_likes" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ec6698ead14ad945033ebb2f1b" ON "comment_likes" ("commentId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_42feb32d0813bf6097bb8c41bb" ON "comment_likes" ("commentId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94ffa05f2fb3da114904ba901b" ON "comments" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64f233b07a60bed2b2fcbf7ee2" ON "comments" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e44ddaaa6d058cb4092f83ad61" ON "comments" ("postId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e8d7c49f218ebb14314fdb374" ON "comments" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46bc204f43827b6f25e0133dbf" ON "posts" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2fdceba3d316f92cf224ba56fa" ON "posts" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55d9c167993fed3f375391c8e3" ON "posts" ("blogId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55d9c167993fed3f375391c8e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2fdceba3d316f92cf224ba56fa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46bc204f43827b6f25e0133dbf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e8d7c49f218ebb14314fdb374"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e44ddaaa6d058cb4092f83ad61"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64f233b07a60bed2b2fcbf7ee2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94ffa05f2fb3da114904ba901b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_42feb32d0813bf6097bb8c41bb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec6698ead14ad945033ebb2f1b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3572e068a66569a0fb2f3ed7b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7f7397812756766dca1ef7496"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_30ee85070afe5b92b5920957b1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f5a86465d43c2db24ea46f0644"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3afc08c4141be9001daef63f9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0a3e56b91a130ad59dabee524c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a32f641edba1d0f973c19cc94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_204e9b624861ff4a5b26819210"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD "test2" character varying(25)`,
    );
  }
}
