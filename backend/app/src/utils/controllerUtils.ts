
import { FastifyReply } from 'fastify'
import HttpError from './httpError.ts';

export function handleControllerError(reply: FastifyReply, error: any) {
	if (error instanceof HttpError) {
		return reply.status(error.statusCode).send({
			success: false,
			message: error.message,
		})
	}
	return reply.status(500).send({
		success: false,
		message: "Internal server error",
	});
}

