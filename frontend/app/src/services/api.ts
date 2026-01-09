
import HttpError from '../utils/httpError.ts'

class ApiService {
	private baseUrl = '/api';

	async post<T>(endpoint: string, data: any): Promise<T> {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST', 
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data)
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 401)
					throw new HttpError(401, errorData.message)
				throw new Error (errorData.message || `HTTP error status: ${response.status}`);
			}

			return await response.json();
		}
		catch (error) {
			// console.error(`API error: ${endpoint}: `, error);
			throw error;
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 401)
					throw new HttpError(401, errorData.message)
				throw new Error (errorData.message || `HTTP error status: ${response.status}`);
			}

			return await response.json();
		}
		catch (error) {
			// console.error(`API error: ${endpoint}: `, error);
			throw error;
		}
	}

	async postFile<T>(endpoint: string, data: any): Promise<T> {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				method: 'POST', 
				body: data
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (response.status === 401)
					throw new HttpError(401, errorData.message)
				throw new Error (errorData.message || `HTTP error status: ${response.status}`);
			}

			return await response.json();
		}
		catch (error) {
			// console.error(`API error: ${endpoint}: `, error);
			throw error;
		}
	}
}

export const apiService = new ApiService();
