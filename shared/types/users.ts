
export interface UpdatePasswordData {
	actualPassword: string;
	newPassword: string;
}

export interface UserInfo {
	username?: string;
	email?: string;
	avatar?: string;
	blocked?: string[];
	isPasswd?: boolean;
	google?: boolean;
}

export interface UserErrors {
	username?: string;
	avatar?: string;
	email?: string;
	password?: string;
	newPassword?: string;
}

export interface UserResponse {
	success: boolean;
	message: string;
	user?: UserInfo;
	errors?: UserErrors;
	code?: string;
}



export interface UsersInfo {
	username: string;
	elo?: number;
	link_avatar?: string;
	me?: boolean;
	online?: boolean;
	created_at?: string;
	is_anon?: number;
}

export interface UsersListResponse {
	success: boolean;
	message: string;
	users?: UsersInfo[];
}



export interface BasicResponse {
	success: boolean;
	message: string;
}

export type InvitationStatus = 'none' | 'sent' | 'received' | 'accepted' | 'occupied';

export interface UserGameState {
	username: string;
	link_avatar?: string;
	online: boolean;
	elo?: number;
	friend: boolean;
	invite: InvitationStatus;
	matchId?: string;
	is_anon?: number;
}

export type FriendInviteStatus = 'none' | 'sent' | 'received';

export interface UserFriendState {
	username: string;
	link_avatar: string;
	online?: boolean;
	elo: number;
	invite?: FriendInviteStatus;
	inviteGameStatus?: InvitationStatus;
	is_anon?: number;
}
