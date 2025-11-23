import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostEntity1763533589536 implements MigrationInterface {
    name = 'AddPostEntity1763533589536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "title" character varying(30) NOT NULL, "shortDescription" character varying(100) NOT NULL, "content" character varying(1000) NOT NULL, "blogId" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "createdAt" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
