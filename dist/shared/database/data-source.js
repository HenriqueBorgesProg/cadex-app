"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Point_1 = require("../../modules/points/entity/Point");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "cadex",
    password: process.env.DB_PASSWORD || "cadex",
    database: process.env.DB_NAME || "cadex_network",
    entities: [Point_1.Point],
});
