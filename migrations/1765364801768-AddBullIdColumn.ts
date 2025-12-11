import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBullIdColumn1765364801768 implements MigrationInterface {
    name = 'AddBullIdColumn1765364801768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" ADD "finishTimeoutJobId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "finishTimeoutJobId"`);
    }

}
