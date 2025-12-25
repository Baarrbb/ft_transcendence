
import Database from 'better-sqlite3';

// script modif db quand deja initialise
const db = new Database('/db/db.sqlite3');
db.prepare('ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE').run();
console.log('Colonne ajoutée');
// db.prepare('ALTER TABLE invitation DROP COLUMN status').run();
// console.log('Colonne supprimée');
// db.prepare('DELETE FROM authentification WHERE user_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM blocked_users WHERE blocker_id NOT IN (SELECT user_id FROM users)').run();
// db.prepare('DELETE FROM blocked_users WHERE blocked_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM channel_members WHERE user_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM friendships WHERE requester_id NOT IN (SELECT user_id FROM users)').run();
// db.prepare('DELETE FROM friendships WHERE addressee_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM invitation WHERE from_user NOT IN (SELECT user_id FROM users)').run();
// db.prepare('DELETE FROM invitation WHERE to_user NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM jwt WHERE user_id NOT IN (SELECT user_id FROM users)').run();

// // db.prepare('DELETE FROM match WHERE loser_id NOT IN (SELECT user_id FROM users)').run();
// // db.prepare('DELETE FROM match WHERE winner_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM match_invitation WHERE from_user NOT IN (SELECT user_id FROM users)').run();
// db.prepare('DELETE FROM match_invitation WHERE to_user NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM messages WHERE sender_id NOT IN (SELECT user_id FROM users)').run();

// db.prepare('DELETE FROM sessions WHERE user_id NOT IN (SELECT user_id FROM users)').run();

db.close();


// execute node script.js dans docker