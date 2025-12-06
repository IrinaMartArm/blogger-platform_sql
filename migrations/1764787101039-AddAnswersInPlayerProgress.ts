import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnswersInPlayerProgress1764787101039 implements MigrationInterface {
    name = 'AddAnswersInPlayerProgress1764787101039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" ADD "answers" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "answers"`);
    }

}
