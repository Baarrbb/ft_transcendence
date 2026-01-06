
import fastifyWebsocket from '@fastify/websocket';
// import Database from 'better-sqlite3';
import { initDatabase, getDatabase } from './db.ts'
import Fastify from 'fastify'
import cors from '@fastify/cors'
// import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import fastifyJwt from '@fastify/jwt';
// import path from 'path';

import authRoutes from './modules/auth/auth.routes.ts'
import usersRoutes from './modules/users/users.routes.ts'
import friendsRoutes from './modules/friends/friends.routes.ts'
import blockUsersRoutes from './modules/blockUsers/blockUsers.routes.ts'
import socketsRoutes from './modules/sockets/sockets.routes.ts'
import chatRoutes from './modules/chat/chat.routes.ts'
import matchRoutes from './modules/match/match.routes.ts'
import { PublicUser } from './modules/users/users.model.ts';
import { config } from './config.ts'

declare module 'fastify' {
	interface FastifyRequest {
		localUser?: PublicUser;
		auth: 'PRE_2FA' | 'AUTH' | 'LINK_TOKEN' | 'NONE';
	}
}

async function startServer() {
	try {
		// console.log('Initializing database...');
		initDatabase();

		// console.log('Creating Fastify instance...');
		const fastify = Fastify({
			logger: true
		});
	
		await fastify.register(cors, {
			// origin: '*',
			origin: ['http://frontend:5173', "http://localhost:5173"],
			methods: ['GET', 'POST'],
			credentials: true,
		});

		await fastify.register(import('@fastify/cookie'), {
			secret: config.cookieSecret || 'your-secret-key-for-signing-cookies'
		})

		await fastify.register(fastifyJwt, {
			secret: process.env.JWT_SECRET || 'supersecretkey',
		});

		await fastify.register(fastifyMultipart);

		await fastify.register(fastifyStatic, {
			root: '/app/uploads',
			prefix: '/uploads/',
		});

		fastify.register(fastifyWebsocket);

		// fastify.decorateRequest('user', null);
		await fastify.register(authRoutes);
		await fastify.register(usersRoutes);
		await fastify.register(friendsRoutes);
		await fastify.register(blockUsersRoutes);
		await fastify.register(socketsRoutes);
		await fastify.register(chatRoutes);
		await fastify.register(matchRoutes);
		// console.log('✅ Users routes registered');

		// console.log('Starting server...');
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
		// console.log("Server started successfully");
	}
	catch (err) {
		console.error("FATAL ERROR: ", err);
		process.exit(1);
	}
}

startServer();
