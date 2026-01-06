import { getDatabase } from '../db.ts'
// import Database from 'better-sqlite3';

export function runQuery(query: string, params: any[] = []): any {
	try {
		const db = getDatabase();
		const stmt = db.prepare(query);

		if (query.trim().toLowerCase().startsWith('select'))
			return stmt.all(params);
		else {
			const result = stmt.run(params);
			// if (result.changes == 0 && !query.trim().toLowerCase().startsWith('delete'))
			// 	throw new Error('Database failed');
			// return stmt.run(params);
			return result;
		}
	}
	catch(err) {
		console.error('Error executing query:', err);
		throw err;
	}
}

export function getQuery(query: string, params: any[] = []): any {

	try {
		const db = getDatabase();
		const stmt = db.prepare(query);
		return stmt.get(params);
	}
	catch (error) {
		console.error('Error executing query:', error);
		throw error;
	}
}

	// return new Promise((resolve, reject) => {
	// 	db.get(query, params, (err, row) => {
	// 		if (err) {
	// 		reject(err); // If an error occurs, reject the promise
	// 		} else {
	// 		resolve(row); // Resolves with the row (the result)
	// 		}
	// 	});
	// });

