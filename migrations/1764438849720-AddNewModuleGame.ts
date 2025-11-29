import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewModuleGame1764438849720 implements MigrationInterface {
  name = 'AddNewModuleGame1764438849720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" SERIAL NOT NULL, "body" character varying(500) NOT NULL, "correctAnswers" jsonb NOT NULL, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "players" ("id" SERIAL NOT NULL, "score" integer NOT NULL DEFAULT '0', "userId" integer NOT NULL, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c11c744c0601ab432cfa6ff7a" ON "players" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" SERIAL NOT NULL, "status" "public"."games_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer', "firstPlayerProgressId" integer NOT NULL, "secondPlayerProgressId" integer, "pairCreatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "startGameDate" TIMESTAMP WITH TIME ZONE, "finishGameDate" TIMESTAMP WITH TIME ZONE, "questions" jsonb, CONSTRAINT "REL_89fa7cd3b42fda01f86c27fca9" UNIQUE ("firstPlayerProgressId"), CONSTRAINT "REL_7ceb9c9d8be5c0be16eb1a49e9" UNIQUE ("secondPlayerProgressId"), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05318b3cbff2443bd581093bcb" ON "games" ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_89fa7cd3b42fda01f86c27fca9b" FOREIGN KEY ("firstPlayerProgressId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_7ceb9c9d8be5c0be16eb1a49e94" FOREIGN KEY ("secondPlayerProgressId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "games" DROP CONSTRAINT "FK_7ceb9c9d8be5c0be16eb1a49e94"`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" DROP CONSTRAINT "FK_89fa7cd3b42fda01f86c27fca9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" DROP CONSTRAINT "FK_7c11c744c0601ab432cfa6ff7ad"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05318b3cbff2443bd581093bcb"`,
    );
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c11c744c0601ab432cfa6ff7a"`,
    );
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "questions"`);
  }
}
