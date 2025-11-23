import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1763465836794 implements MigrationInterface {
    name = 'Init1763465836794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "devices" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "deviceId" character varying(200) NOT NULL, "ip" character varying(20) NOT NULL, "userAgent" character varying(500) NOT NULL, "lastActive" TIMESTAMP WITH TIME ZONE NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_e8a5d59f0ac3040395f159507c6" UNIQUE ("userId"), CONSTRAINT "UQ_666c9b59efda8ca85b29157152c" UNIQUE ("deviceId"), CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "email_confirmations" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "isEmailConfirmed" boolean NOT NULL, "confirmationCode" character varying(100), "expirationDate" TIMESTAMP WITH TIME ZONE, "isPasswordRecoveryActive" boolean NOT NULL, CONSTRAINT "UQ_930e1d7c0171d23e5535b1e3873" UNIQUE ("userId"), CONSTRAINT "REL_930e1d7c0171d23e5535b1e387" UNIQUE ("userId"), CONSTRAINT "PK_178b5599cd7e3ec9cfdfb144b50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "deletedAt" TIMESTAMP WITH TIME ZONE, "login" character varying(10) COLLATE "C" NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying(100) NOT NULL, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blogs" ("id" SERIAL NOT NULL, "name" character varying(15) NOT NULL, "description" character varying(500) NOT NULL, "websiteUrl" character varying(100) NOT NULL, "isMembership" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_confirmations" ADD CONSTRAINT "FK_930e1d7c0171d23e5535b1e3873" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_confirmations" DROP CONSTRAINT "FK_930e1d7c0171d23e5535b1e3873"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_e8a5d59f0ac3040395f159507c6"`);
        await queryRunner.query(`DROP TABLE "blogs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "email_confirmations"`);
        await queryRunner.query(`DROP TABLE "devices"`);
    }

}
