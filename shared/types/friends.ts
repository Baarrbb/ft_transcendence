

export interface PendingInvitation {
	success: boolean;
	message: string;
	from_me?: boolean;
	from_username?: string;
	to_username?: string;
	created_at?: string;
	updated_at?: string;
}

