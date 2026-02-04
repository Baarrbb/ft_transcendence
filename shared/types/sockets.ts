import type { MessageType } from "./chat.ts";


export interface SocketPayloadUser {
	type: string;
	username: string;
	link_avatar?: string;
	elo?: number;
	friend?: boolean;
}

export interface SocketPayloadChat {
	type: string;
	username: string;
	channelId?: number;
	message?: string;
	battle?: string | null;
	date?: number;
	typeMsg?: MessageType;
	typing: boolean;
}

export interface SocketPayloadGame {
	type: string;
	side: string;
	pos_y: number;
}
