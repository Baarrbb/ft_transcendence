
import { z } from 'zod';

export const RegisterDataSchema = z.object({
	email: z.string()
		.trim()
		.min(1, 'Email is required')
		.refine(val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
			message: 'Please enter a valid email address',
		}),
		// .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Email invalid'),
	username: z.string()
		.trim()
		.min(1, 'Username is required')
		.max(20, 'Username must be less than 20 characters')
		.regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});

export const UpdatePasswordSchema = z.object({
	password: z.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long')
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
	confirmPassword: z.string()
		.min(8, 'Password must be at least 8 characters')
		.max(100, 'Password is too long'),
})
.refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

// export type RegisterDataInput = z.infer<typeof RegisterDataSchema>;
