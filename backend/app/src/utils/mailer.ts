import nodemailer from 'nodemailer';
import { config } from '../config.ts';

export const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: config.emailUser,
		pass: config.emailPass,
	}
});
