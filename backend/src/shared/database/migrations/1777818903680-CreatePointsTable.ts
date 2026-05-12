import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePointsTable1777818903680 implements MigrationInterface {
    name = 'CreatePointsTable1777818903680'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."point_type_enum" AS ENUM('client', 'pole')`);
        await queryRunner.query(`CREATE TABLE "points" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."point_type_enum" NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57a558e5e1e17668324b165dadf" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "points"`);
        await queryRunner.query(`DROP TYPE "public"."point_type_enum"`);
    }

}
