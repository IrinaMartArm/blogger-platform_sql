import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniqueFromUserIdDevice1763729459074 implements MigrationInterface {
    name = 'RemoveUniqueFromUserIdDevice1763729459074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "UQ_e8a5d59f0ac3040395f159507c6"`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "isMembership" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."post_likes_status_enum" AS ENUM('None', 'Like', 'Dislike')`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "status" "public"."post_likes_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ALTER COLUMN "commentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."comment_likes_status_enum" AS ENUM('None', 'Like', 'Dislike')`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD "status" "public"."comment_likes_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."comment_likes_status_enum"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ALTER COLUMN "commentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_abbd506a94a424dd6a3a68d26f4" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."post_likes_status_enum"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "status" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "isMembership" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "UQ_e8a5d59f0ac3040395f159507c6" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
