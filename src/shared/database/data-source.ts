import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "cadex",
    password: process.env.DB_PASSWORD || "cadex",
    database: process.env.DB_NAME || "cadex_network",
});
