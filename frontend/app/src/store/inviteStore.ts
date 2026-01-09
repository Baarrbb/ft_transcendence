
import type { UserGameState, InvitationStatus } from '@shared/types/users.ts';


export class InviteStore {

	private users: Map<string, UserGameState> = new Map();
	private friends: Map<string, UserGameState> = new Map();
	// private listeners: Map<string, (user: UserGameState) => void> = new Map();
	private listeners: Map< string, Set<(user: UserGameState) => void> > = new Map();

	subscribe(username: string, listener: (user: UserGameState) => void) {
		if (!this.listeners.has(username))
			this.listeners.set(username, new Set());

		this.listeners.get(username)!.add(listener);
		// this.listeners.set(username, listener);
	}

	// unsubscribe(username: string, listener?: (user: UserGameState) => void) {
	// 	if (!listener) {
	// 		this.listeners.delete(username);
	// 	} else {
	// 		this.listeners.get(username)?.delete(listener);
	// 	}
	// }
	unsubscribe(username: string) {
		this.listeners.delete(username);
	}

	private notify(username: string) {
		const user = this.findUser(username);
		if (!user)
			return;
		const listener = this.listeners.get(username);
		if (listener)
			listener.forEach(l => l(user));
			// listener(user);

	}

	setUsers(users: UserGameState[]) {
		// this.users = users;
		this.users.clear();
		users.forEach(user => this.users.set(user.username, user));
	}

	getUsers(): UserGameState[] {
		return Array.from(this.users.values());
	}

	getUser(username: string): UserGameState | undefined {
		return this.users.get(username);
	}

	addUser(user: UserGameState) {
		this.users.set(user.username, user);
	}

	removeUser(username: string) {
		this.users.delete(username);
	}

	setFriends(friends: UserGameState[]) {
		this.friends.clear();
		friends.forEach(friend => this.friends.set(friend.username, friend));
	}

	getFriends(): UserGameState[] {
		return Array.from(this.friends.values());
	}

	getFriend(username: string): UserGameState | undefined {
		return this.friends.get(username);
	}

	addFriend(user: UserGameState) {
		this.friends.set(user.username, user);
	}

	removeFriend(username: string) {
		this.friends.delete(username);
	}

	private findUser(username: string): UserGameState | undefined {
		return this.users.get(username) || this.friends.get(username);
	}

	updateInvite(username: string, newInvite: InvitationStatus, oldInvite: InvitationStatus, matchId?: string) {
		const user = this.findUser(username);
		if (!user)
			return;

		if (oldInvite !== user.invite)
			return;

		user.invite = newInvite;
		if (matchId)
			user.matchId = matchId;

		this.notify(username);
	}

}

export const inviteStore = new InviteStore();
