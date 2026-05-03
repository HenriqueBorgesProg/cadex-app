import "reflect-metadata";
import { DataSource } from "typeorm";
import { Point } from "../../modules/points/entity/Point";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "cadex",
    password: process.env.DB_PASSWORD || "cadex",
    database: process.env.DB_NAME || "cadex_network",
    entities: [Point],
    migrations: ["src/shared/database/migrations/*.ts"],
    synchronize: false,
});
