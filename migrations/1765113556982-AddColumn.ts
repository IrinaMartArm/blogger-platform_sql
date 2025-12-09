import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumn1765113556982 implements MigrationInterface {
    name = 'AddColumn1765113556982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."players_resultstatus_enum" AS ENUM('WIN', 'LOSS', 'DRAW')`);
        await queryRunner.query(`ALTER TABLE "players" ADD "resultStatus" "public"."players_resultstatus_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "resultStatus"`);
        await queryRunner.query(`DROP TYPE "public"."players_resultstatus_enum"`);
    }

}
