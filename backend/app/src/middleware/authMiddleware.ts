
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import HttpError from '../utils/httpError.ts';
import sessionUtils from '../utils/sessionHandling.ts';
import type { PublicUser } from '../modules/users/users.model.ts'
import dbUsers from '../modules/users/users.model.ts'


// export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
// 	const sessionToken = request.cookies.sessionToken;
// 	console.log(sessionToken)
// 	if (!sessionToken)
// 		throw new HttpError(401, "Unauthorized, authentification required");

// 	try {
// 		const userId = await sessionUtils.validateSessionToken(sessionToken);
// 		const user = dbUsers.getUserByUserId(userId);
// 		// console.log("autenticate:", user);
// 		if (!user)
// 			throw new HttpError(401, "Unauthorized, authentification required");
// 		sessionUtils.updateLastActivity(sessionToken);
// 		const { password, ...publicUser } = user as any;
// 		request.localUser = publicUser as PublicUser;
// 	}
// 	catch (error) {
// 		if (error instanceof HttpError)
// 			throw error;
// 		console.log("auth middleware error : ", error.message);
// 		throw new HttpError(500, "Internal server error");
// 	}
// }


export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
	const sessionToken = request.cookies.sessionToken;
	const preSession = request.cookies.pre_auth;
	const linkToken = request.cookies.linkToken;

	if (sessionToken) {
		const userId = await sessionUtils.validateSessionToken(sessionToken);
		const user = dbUsers.getUserByUserId(userId);
		if (!user)
			throw new HttpError(401, "Unauthorized, authentification required");
		sessionUtils.updateLastActivity(sessionToken);
		const { password, ...publicUser } = user as any;
		request.localUser = publicUser as PublicUser;
		request.localUser.isPasswd = user.password ? true : false;
		request.auth = 'AUTH';
		return;
	}
	if (linkToken) {
		request.auth = 'LINK_TOKEN';
		return ;
	}
	if (preSession) {
		const decoded = await (reply.server as FastifyInstance).jwt.verify(preSession) as { userId: string };
		const userId = decoded.userId;
		const user = dbUsers.getUserByUserId(userId);
		if (!user)
			throw new HttpError(401, "Unauthorized, authentification required");
		request.auth = 'PRE_2FA';
		return;
	}

	request.auth = 'NONE';
	throw new HttpError(401, "Unauthorized, authentification required");
}
