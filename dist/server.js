"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const data_source_1 = require("./shared/database/data-source");
const cors_1 = __importDefault(require("@fastify/cors"));
app_1.app.register(cors_1.default, {
    origin: '*',
});
// Run the server!
const start = async () => {
    try {
        // Initialize database
        await data_source_1.AppDataSource.initialize();
        app_1.app.log.info('Database connected!');
        await app_1.app.listen({ port: 3000 });
        const address = app_1.app.server.address();
        app_1.app.log.info(`server listening on ${address?.port}`);
    }
    catch (err) {
        app_1.app.log.error(err);
        process.exit(1);
    }
};
start();
