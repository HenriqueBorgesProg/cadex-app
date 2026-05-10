import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/AppError";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    });
  }

  request.log.error(error);

  return reply.status(500).send({
    error: {
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
    },
  });
}
