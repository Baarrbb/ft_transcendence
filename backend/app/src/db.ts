
import Database from 'better-sqlite3';
import fs from 'fs';

let db: Database.Database | null = null;
const DB_PATH = '/db/db.sqlite3';


// Voir si on utilise une transaction pour que toutes les tables s'initialise ou rien
// Ici en soit on renvoie deja db = null si pb qql part
export function initDatabase(): void {
	if (db) {
		// console.log('Db already initialized');
		return;
	}
	try {

		db = new Database(DB_PATH, {
			// verbose: console.log,  // a enlever en prod c;est ca qui affiche toute les actions sur bdd
		});

		const transaction = db.transaction(() => {
			// email not null ? si co via externe forcement email ?
			// password par defaut null pcq si connexion externe ?
			// j'ai vireer level pcq c'est elo qui nous interersee
			// reset_token TEXT,
			// reset_token_expiry DATETIME,
			db.prepare(`
				CREATE TABLE IF NOT EXISTS users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id TEXT UNIQUE,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					username TEXT NOT NULL UNIQUE,
					email TEXT NOT NULL UNIQUE,
					password TEXT DEFAULT NULL,
					link_avatar TEXT DEFAULT 'avatar.jpg',
					online INTEGER DEFAULT 0,
					remember BOOLEAN DEFAULT FALSE,
					elo INTEGER DEFAULT 1500,
					elo_drift INTEGER DEFAULT 150,
					google_id TEXT UNIQUE DEFAULT NULL,
					in_game BOOLEAN DEFAULT FALSE,
					is_anon BOOLEAN DEFAULT FALSE
				)
			`).run();
			// console.log("Db users initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS authentification (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id TEXT UNIQUE,
					totp_secret TEXT,
					is_totp_enabled BOOLEAN DEFAULT FALSE,
					session_token TEXT,
					session_expiry DATETIME,
					reset_token TEXT,
					reset_token_expiry DATETIME
				)
			`).run();
			// console.log("Db authentification initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS sessions (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					user_id TEXT NOT NULL,
					session_token TEXT NOT NULL UNIQUE,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					expires_at DATETIME NOT NULL,
					last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
					last_ip TEXT,
					data TEXT DEFAULT '{}'
				)
			`).run();
			// console.log("Db sessions initialized");

			// db.prepare(`
			// 	CREATE TABLE IF NOT EXISTS match (
			// 		id INTEGER PRIMARY KEY AUTOINCREMENT,
			// 		user1_id TEXT NOT NULL,
			// 		user1_elo_before INTEGER DEFAULT 1500,
			// 		user1_score INTEGER DEFAULT 0,
			// 		user1_drift INTEGER DEFAULT 150,
			// 		user2_id TEXT NOT NULL,
			// 		user2_score INTEGER DEFAULT 0,
			// 		user2_elo_before INTEGER DEFAULT 1500,
			// 		user2_drift INTEGER DEFAULT 150,
			// 		winner_id TEXT DEFAULT NULL,
			// 		game_mod TEXT DEFAULT NULL,
			// 		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			// 		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			// 	)
			// `).run();
			// console.log("Db match initialized");
			db.prepare(`
				CREATE TABLE IF NOT EXISTS match (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					winner_id TEXT NOT NULL,
					winner_elo_before INTEGER DEFAULT 1500,
					winner_score INTEGER DEFAULT 0,
					winner_drift INTEGER DEFAULT 150,
					loser_id TEXT NOT NULL,
					loser_score INTEGER DEFAULT 0,
					loser_elo_before INTEGER DEFAULT 1500,
					loser_drift INTEGER DEFAULT 150,
					abandon BOOLEAN NOT NULL DEFAULT FALSE,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db match initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS channels (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					channel_name TEXT NOT NULL,
					is_group BOOLEAN NOT NULL DEFAULT FALSE,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db channels initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS channel_members (
					channel_id INTEGER NOT NULL,
					user_id TEXT NOT NULL,
					joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					PRIMARY KEY (channel_id, user_id)
				)
			`).run();
			// console.log("Db channel_members initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS messages (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					channel_name TEXT NOT NULL,
					chat_id TEXT NOT NULL,
					sender_id TEXT NOT NULL,
					msg TEXT NOT NULL,
					type TEXT DEFAULT NULL,
					is_read BOOLEAN DEFAULT FALSE,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db messages initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS jwt (
					id TEXT PRIMARY KEY,
					user_id TEXT NOT NULL UNIQUE,
					refresh_token TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					expires_at DATETIME NOT NULL
				)
			`).run();
			// console.log("Db jwt initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS friendships (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					requester_id TEXT NOT NULL,
					addressee_id TEXT NOT NULL,
					created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db friendships initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS blocked_users (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					blocker_id INTEGER NOT NULL,
					blocked_id INTEGER NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					UNIQUE (blocker_id, blocked_id)
				)
			`).run();
			// console.log("Db blocked_users initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS invitation (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					from_user TEXT NOT NULL,
					to_user TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					expired_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db invitation initialized");

			db.prepare(`
				CREATE TABLE IF NOT EXISTS match_invitation (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					from_user TEXT NOT NULL,
					to_user TEXT NOT NULL,
					is_read BOOLEAN DEFAULT FALSE,
					status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')), 
					match_id TEXT DEFAULT NULL,
					expired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
				)
			`).run();
			// console.log("Db match_invitation initialized");

		});

		transaction();
		// console.log("ALL DB INITIALIZED !");

	}
	catch (err) {
		// console.log("db initialize failed");
		if (db) {
			try {
				db.close();
			}
			catch (e) {
				console.log("Failed to close db after error");
			}
		}
		db = null;
		throw err;
	}
}

export function getDatabase(): Database.Database {
	if (!db) {
		throw new Error('Database not initialized. Call initDatabase() first.');
	}
	if (!fs.existsSync(DB_PATH)) {
		throw new Error('getDatabase() failed');
	}
	return db;
}

export function closeDatabase(): void {
	if (db) {
		db.close();
		db = null;
		// console.log("Db closed");
	}
}
