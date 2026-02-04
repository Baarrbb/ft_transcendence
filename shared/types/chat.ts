
import type { InvitationStatus } from './users.ts';

export interface ChannelInfo {
	success: boolean;
	message: string;
	channel_name: string;
	channel_id: number;
}

export type MessageType = 'message' | 'invitation'

export interface MessageData {
	from: string;
	msg: string;
	date: string;
	type: MessageType;
	read?: boolean;
	typeInvite?: InvitationStatus;
	matchId?: string;
}

export interface ChatHistory {
	success: boolean;
	message: string;
	messages?: MessageData[];
}