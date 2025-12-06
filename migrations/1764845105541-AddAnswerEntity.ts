import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnswerEntity1764845105541 implements MigrationInterface {
  name = 'AddAnswerEntity1764845105541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."answers_answerstatus_enum"
      AS ENUM ('Correct', 'Incorrect')
    `);

    await queryRunner.query(`
      CREATE TABLE "answers" (
                               "id" SERIAL NOT NULL,
                               "questionId" integer NOT NULL,
                               "answerStatus" "public"."answers_answerstatus_enum" NOT NULL,
                               "addedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                               "playerId" integer NOT NULL,
                               CONSTRAINT "PK_answers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "players" DROP COLUMN "answers"
    `);

    await queryRunner.query(`
      ALTER TABLE "answers"
        ADD CONSTRAINT "FK_answers_players"
          FOREIGN KEY ("playerId")
            REFERENCES "players"("id")
            ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "answers" DROP CONSTRAINT "FK_answers_players"
    `);

    await queryRunner.query(`
      ALTER TABLE "players"
        ADD "answers" jsonb NOT NULL DEFAULT '[]'
    `);

    await queryRunner.query(`DROP TABLE "answers"`);

    await queryRunner.query(`DROP TYPE "public"."answers_answerstatus_enum"`);
  }
}
