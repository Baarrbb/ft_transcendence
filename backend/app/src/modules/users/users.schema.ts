import { z } from 'zod';

export const UsernameSchema = z.object({
	username: z.string()
		.trim()
		.min(1, 'Username must be at least 1 character')
		.max(20, 'Username must be less than 20 characters')
		.regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
});


export const EmailSchema = z.object({
	email: z.string()
		.trim()
		.min(1, 'Email is required')
		.refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
			message: 'Please enter a valid email address',
		}),
});

export const PasswordSchema = z.object({
	newPassword: z.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

