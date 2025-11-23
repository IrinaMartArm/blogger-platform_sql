import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFix1763635736087 implements MigrationInterface {
    name = 'AddFix1763635736087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "name" TYPE character varying COLLATE "C"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ALTER COLUMN "name" TYPE character varying COLLATE pg_catalog."default"`);
    }

}
